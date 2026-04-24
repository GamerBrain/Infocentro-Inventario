import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { InventoryItem, CATEGORIES, ITEM_TYPES, CONDITIONS } from "@/lib/types";
import { useLocation } from "wouter";

function generateSerial(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "INF";
  let serial = prefix + "-";
  for (let i = 0; i < 4; i++) serial += chars[Math.floor(Math.random() * chars.length)];
  serial += "-";
  for (let i = 0; i < 4; i++) serial += chars[Math.floor(Math.random() * chars.length)];
  return serial;
}

export default function Dashboard() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "stats">("inventory");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    item_type: "",
    serial: generateSerial(),
    description: "",
    condition: "Bueno",
    location: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as InventoryItem[]);
    setLoading(false);
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", category: "", item_type: "", serial: generateSerial(), description: "", condition: "Bueno", location: "" });
    setShowForm(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      item_type: item.item_type,
      serial: item.serial,
      description: item.description ?? "",
      condition: item.condition,
      location: item.location ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editItem) {
      const updateData: Record<string, string> = {
        name: form.name,
        category: form.category,
        item_type: form.item_type,
        description: form.description,
        condition: form.condition,
        location: form.location,
      };
      if (isAdmin) updateData.serial = form.serial;

      const { error } = await supabase
        .from("inventory_items")
        .update(updateData)
        .eq("id", editItem.id);
      if (error) { showToast("Error al actualizar: " + error.message, "error"); return; }
      showToast("Objeto actualizado correctamente.", "success");
    } else {
      const { error } = await supabase.from("inventory_items").insert({
        name: form.name,
        category: form.category,
        item_type: form.item_type,
        serial: form.serial,
        description: form.description || null,
        condition: form.condition,
        location: form.location || null,
        created_by: user.id,
      });
      if (error) { showToast("Error al registrar: " + error.message, "error"); return; }
      showToast("Objeto registrado correctamente.", "success");
    }
    setShowForm(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) { showToast("Error al eliminar.", "error"); return; }
    showToast("Objeto eliminado.", "success");
    setDeleteConfirm(null);
    fetchItems();
  };

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.serial.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchCat = !filterCategory || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  const stats = {
    total: items.length,
    byCategory: CATEGORIES.map(c => ({ cat: c, count: items.filter(i => i.category === c).length })),
    byCondition: CONDITIONS.map(c => ({ cond: c, count: items.filter(i => i.condition === c).length })),
  };

  const typeOptions = form.category ? (ITEM_TYPES[form.category] ?? []) : [];

  return (
    <div className="dashboard">
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      <header className="dashboard-header">
        <button className="signout-btn" onClick={handleSignOut} title="Cerrar sesión">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar Sesión
        </button>

        <div className="header-center">
          <div className="header-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M12 20h16M12 14h10M12 26h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="30" cy="14" r="3" fill="#4a90d9" />
            </svg>
          </div>
          <div>
            <h1>Info-Inventario</h1>
            <p>Sistema de Control de Activos</p>
          </div>
        </div>

        <div className="header-user">
          <div className="user-avatar">{(profile?.full_name ?? profile?.email ?? "U")[0].toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{profile?.full_name ?? "Usuario"}</span>
            <span className={`user-role ${isAdmin ? "admin" : "user"}`}>{isAdmin ? "Administrador" : "Usuario"}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-tabs">
          <button className={`dash-tab ${activeTab === "inventory" ? "active" : ""}`} onClick={() => setActiveTab("inventory")}>
            Inventario
          </button>
          <button className={`dash-tab ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
            Estadísticas
          </button>
        </div>

        {activeTab === "inventory" && (
          <>
            <div className="toolbar">
              <div className="toolbar-left">
                <input
                  type="search"
                  className="search-input"
                  placeholder="Buscar por nombre, serial o categoría..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={openCreate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Registrar Objeto
              </button>
            </div>

            <div className="table-count">
              Mostrando <strong>{filtered.length}</strong> de <strong>{items.length}</strong> objetos
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner large" />
                <p>Cargando inventario...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                  <rect x="8" y="8" width="48" height="48" rx="8" stroke="#0f2d6e" strokeWidth="2" strokeDasharray="4 3"/>
                  <path d="M24 32h16M32 24v16" stroke="#0f2d6e" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p>{search || filterCategory ? "No se encontraron resultados." : "No hay objetos registrados aún."}</p>
                {!search && !filterCategory && (
                  <button className="btn-primary" onClick={openCreate}>Registrar primer objeto</button>
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Tipo</th>
                      <th>Serial</th>
                      <th>Estado</th>
                      <th>Ubicación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id}>
                        <td className="item-name" data-label="Nombre">{item.name}</td>
                        <td data-label="Categoría"><span className="badge-category">{item.category}</span></td>
                        <td data-label="Tipo">{item.item_type}</td>
                        <td data-label="Serial"><code className="serial-code">{item.serial}</code></td>
                        <td data-label="Estado"><span className={`badge-condition cond-${item.condition.replace(/ /g, "-").toLowerCase()}`}>{item.condition}</span></td>
                        <td data-label="Ubicación">{item.location ?? "—"}</td>
                        <td className="actions-cell" data-label="Acciones">
                          <button className="btn-icon edit" onClick={() => openEdit(item)} title="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          {isAdmin && (
                            <button className="btn-icon delete" onClick={() => setDeleteConfirm(item.id)} title="Eliminar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "stats" && (
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total de Objetos Registrados</div>
            </div>
            <div className="stat-card">
              <h3>Por Categoría</h3>
              <div className="stat-bars">
                {stats.byCategory.filter(s => s.count > 0).map(s => (
                  <div key={s.cat} className="stat-bar-row">
                    <span className="stat-bar-label">{s.cat}</span>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill" style={{ width: stats.total ? `${(s.count / stats.total) * 100}%` : "0%" }} />
                    </div>
                    <span className="stat-bar-count">{s.count}</span>
                  </div>
                ))}
                {stats.byCategory.every(s => s.count === 0) && <p className="no-data">Sin datos aún</p>}
              </div>
            </div>
            <div className="stat-card">
              <h3>Por Estado</h3>
              <div className="stat-bars">
                {stats.byCondition.filter(s => s.count > 0).map(s => (
                  <div key={s.cond} className="stat-bar-row">
                    <span className="stat-bar-label">{s.cond}</span>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill" style={{ width: stats.total ? `${(s.count / stats.total) * 100}%` : "0%" }} />
                    </div>
                    <span className="stat-bar-count">{s.count}</span>
                  </div>
                ))}
                {stats.byCondition.every(s => s.count === 0) && <p className="no-data">Sin datos aún</p>}
              </div>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editItem ? "Editar Objeto" : "Registrar Nuevo Objeto"}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Objeto *</label>
                  <input
                    type="text"
                    placeholder="Ej. Computadora HP EliteBook"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value, item_type: "" }))}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Mobiliario / Equipo *</label>
                  <select
                    value={form.item_type}
                    onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))}
                    required
                    disabled={!form.category}
                  >
                    <option value="">Seleccionar tipo</option>
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {!form.category && <span className="field-hint">Selecciona primero una categoría</span>}
                </div>
                <div className="form-group">
                  <label>Estado / Condición *</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                    required
                  >
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Serial
                    {!isAdmin && <span className="admin-only-badge">Solo admin puede modificar</span>}
                  </label>
                  <input
                    type="text"
                    value={form.serial}
                    onChange={e => isAdmin && setForm(f => ({ ...f, serial: e.target.value }))}
                    readOnly={!isAdmin}
                    className={!isAdmin ? "readonly-field" : ""}
                  />
                  {isAdmin && (
                    <button type="button" className="btn-regenerate" onClick={() => setForm(f => ({ ...f, serial: generateSerial() }))}>
                      Generar nuevo serial
                    </button>
                  )}
                </div>
                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    placeholder="Ej. Sala principal, cubículo 3"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción / Observaciones</label>
                <textarea
                  placeholder="Detalles adicionales, accesorios incluidos, observaciones..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editItem ? "Guardar Cambios" : "Registrar Objeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>Eliminar objeto</h3>
            <p>Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este objeto del inventario?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
