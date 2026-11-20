import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { getWorkspaceSnapshot, saveWorkspaceSnapshot } from './src/db/inventoryRepo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Authenticated Cloud SQL workspace endpoints
  app.get('/api/inventory/state', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      const name = typeof req.user?.name === 'string' ? req.user.name : undefined;
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized: Missing UID' });
      }

      const dbUser = await getOrCreateUser(uid, email, name);
      const snapshot = await getWorkspaceSnapshot(dbUser.id);

      return res.json({
        user: dbUser,
        snapshot: snapshot ? snapshot.data : null,
        updatedAt: snapshot?.updatedAt || null,
      });
    } catch (error: any) {
      console.error('Failed to load workspace state:', error);
      return res.status(500).json({ error: error.message || 'Failed to load workspace state' });
    }
  });

  app.put('/api/inventory/state', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      const name = typeof req.user?.name === 'string' ? req.user.name : undefined;
      if (!uid) {
        return res.status(401).json({ error: 'Unauthorized: Missing UID' });
      }

      const { data, device } = req.body || {};
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid payload: data object is required' });
      }

      const dbUser = await getOrCreateUser(uid, email, name);
      const saved = await saveWorkspaceSnapshot(dbUser.id, data, typeof device === 'string' ? device : undefined);

      return res.json({
        success: true,
        updatedAt: saved.updatedAt,
      });
    } catch (error: any) {
      console.error('Failed to save workspace state:', error);
      return res.status(500).json({ error: error.message || 'Failed to save workspace state' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
