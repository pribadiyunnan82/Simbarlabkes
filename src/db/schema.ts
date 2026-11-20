import { relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Authenticated Firebase users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Master items stored relationally per user workspace
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  externalId: text('external_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  categoryId: text('category_id'),
  unitId: text('unit_id'),
  locationId: text('location_id'),
  currentStock: numeric('current_stock').notNull().default('0'),
  minimumStock: numeric('minimum_stock').notNull().default('0'),
  price: numeric('price').notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Purchase Orders (Surat Pesanan) stored relationally
export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  externalId: text('external_id').notNull(),
  nomorSurat: text('nomor_surat').notNull(),
  tanggal: text('tanggal').notNull(),
  namaSupplier: text('nama_supplier').notNull(),
  status: text('status').notNull().default('Diterbitkan'),
  totalHarga: numeric('total_harga').notNull().default('0'),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order Request Letters (Surat Pengajuan Pesanan) stored relationally
export const orderRequests = pgTable('order_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  externalId: text('external_id').notNull(),
  nomor: text('nomor').notNull(),
  perihal: text('perihal').notNull(),
  tanggal: text('tanggal').notNull(),
  namaPemohon: text('nama_pemohon').notNull(),
  nipPemohon: text('nip_pemohon').notNull(),
  status: text('status').notNull().default('Diajukan'),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Full synchronized workspace state per user for seamless multi-device persistence
export const workspaceSnapshots = pgTable('workspace_snapshots', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  data: jsonb('data').notNull(),
  device: text('device'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Drizzle Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  inventoryItems: many(inventoryItems),
  purchaseOrders: many(purchaseOrders),
  orderRequests: many(orderRequests),
  workspaceSnapshot: one(workspaceSnapshots, {
    fields: [users.id],
    references: [workspaceSnapshots.userId],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  owner: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  owner: one(users, {
    fields: [purchaseOrders.userId],
    references: [users.id],
  }),
}));

export const orderRequestsRelations = relations(orderRequests, ({ one }) => ({
  owner: one(users, {
    fields: [orderRequests.userId],
    references: [users.id],
  }),
}));

export const workspaceSnapshotsRelations = relations(workspaceSnapshots, ({ one }) => ({
  owner: one(users, {
    fields: [workspaceSnapshots.userId],
    references: [users.id],
  }),
}));
