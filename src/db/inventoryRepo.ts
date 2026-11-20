import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  inventoryItems,
  orderRequests,
  purchaseOrders,
  workspaceSnapshots,
} from './schema.ts';

export async function getWorkspaceSnapshot(userId: number) {
  try {
    const rows = await db
      .select()
      .from(workspaceSnapshots)
      .where(eq(workspaceSnapshots.userId, userId))
      .limit(1);

    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getWorkspaceSnapshot:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function saveWorkspaceSnapshot(
  userId: number,
  data: Record<string, unknown>,
  device?: string
) {
  try {
    const now = new Date();
    const [saved] = await db
      .insert(workspaceSnapshots)
      .values({
        userId,
        data,
        device: device || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: workspaceSnapshots.userId,
        set: {
          data,
          device: device || null,
          updatedAt: now,
        },
      })
      .returning();

    // Sync relational tables within the same request cleanly
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const rawOrders = Array.isArray(data.orderRequests) ? data.orderRequests : [];
    const rawPOs = Array.isArray(data.purchaseOrders) ? data.purchaseOrders : [];

    await db.transaction(async (tx) => {
      await tx.delete(inventoryItems).where(eq(inventoryItems.userId, userId));
      if (rawItems.length > 0) {
        await tx.insert(inventoryItems).values(
          rawItems.map((item: any) => ({
            userId,
            externalId: String(item.id || ''),
            code: String(item.code || ''),
            name: String(item.name || ''),
            categoryId: item.categoryId ? String(item.categoryId) : null,
            unitId: item.unitId ? String(item.unitId) : null,
            locationId: item.locationId ? String(item.locationId) : null,
            currentStock: String(Number(item.currentStock) || 0),
            minimumStock: String(Number(item.minimumStock) || 0),
            price: String(Number(item.price) || 0),
            updatedAt: now,
          }))
        );
      }

      await tx.delete(orderRequests).where(eq(orderRequests.userId, userId));
      if (rawOrders.length > 0) {
        await tx.insert(orderRequests).values(
          rawOrders.map((req: any) => ({
            userId,
            externalId: String(req.id || ''),
            nomor: String(req.nomor || ''),
            perihal: String(req.perihal || ''),
            tanggal: String(req.tanggal || ''),
            namaPemohon: String(req.namaPemohon || ''),
            nipPemohon: String(req.nipPemohon || ''),
            status: String(req.status || 'Diajukan'),
            payload: req,
            updatedAt: now,
          }))
        );
      }

      await tx.delete(purchaseOrders).where(eq(purchaseOrders.userId, userId));
      if (rawPOs.length > 0) {
        await tx.insert(purchaseOrders).values(
          rawPOs.map((po: any) => ({
            userId,
            externalId: String(po.id || ''),
            nomorSurat: String(po.nomorSurat || ''),
            tanggal: String(po.tanggal || ''),
            namaSupplier: String(po.namaSupplier || po.supplierName || ''),
            status: String(po.status || 'Diterbitkan'),
            totalHarga: String(Number(po.totalHarga) || 0),
            payload: po,
            updatedAt: now,
          }))
        );
      }
    });

    return saved;
  } catch (error) {
    console.error('Database query failed in saveWorkspaceSnapshot:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
