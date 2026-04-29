import { useState, useEffect } from 'react';
import api from '../api';

function CategoryForm({ onSaved, editItem, onCancel }) {
  const [name, setName] = useState(editItem?.name || '');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      if (editItem) await api.put(`/categories/${editItem.id}`, { name });
      else await api.post('/categories', { name });
      onSaved();
    } catch (e) { alert('خطأ في حفظ التصنيف'); }
    setLoading(false);
  };

  return (
    <div className="card p-4 mb-4" style={{ background: '#f8fafc' }}>
      <h3 className="font-bold mb-3">{editItem ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h3>
      <div className="form-group">
        <label className="form-label">اسم التصنيف</label>
        <input className="form-input" placeholder="مثلاً: مشروبات باردة" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ التصنيف'}</button>
        <button className="btn btn-ghost" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}

function ItemForm({ categories, onSaved, editItem, onCancel }) {
  const [form, setForm] = useState({
    category_id: editItem?.category_id || categories[0]?.id || '',
    name: editItem?.name || '',
    description: editItem?.description || '',
    price: editItem?.price || '',
    is_available: editItem?.is_available ?? true,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (image) formData.append('image', image);

    try {
      if (editItem) {
        formData.append('_method', 'PUT');
        await api.post(`/menu-items/${editItem.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/menu-items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } catch (e) {
      console.error('Save Item Error:', e.response?.data);
      const msg = e.response?.data?.message || 'خطأ غير معروف';
      alert(`خطأ في حفظ الصنف: ${msg}`);
    }
    setLoading(false);
  };

  return (
    <div className="card p-4 mb-4" style={{ background: '#f8fafc' }}>
      <h3 className="font-bold mb-3">{editItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
      <div className="grid cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">التصنيف</label>
          <select className="form-input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">اسم الصنف</label>
          <input className="form-input" placeholder="مثلاً: كابتشينو" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">السعر (₪)</label>
          <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">وصف المنتج (اختياري)</label>
        <input className="form-input" placeholder="اكتب وصفاً قصيراً..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">صورة المنتج (اختياري)</label>
        <input type="file" className="form-input" accept="image/*" onChange={e => setImage(e.target.files[0])} />
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} />
          <span className="font-bold">متاح حالياً للطلب</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ الصنف'}</button>
        <button className="btn btn-ghost" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, iRes] = await Promise.all([api.get('/categories'), api.get('/menu-items')]);
      // Support both {categories: []} and direct array response
      setCategories(cRes.data.categories || cRes.data || []);
      setItems(iRes.data.items || iRes.data || []);
    } catch (e) {
      console.error('Menu Fetch Error:', e);
      alert('فشل في تحميل المنيو. يرجى التأكد من تسجيل الدخول أو تحديث الصفحة.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteCat = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع المنتجات التابعة له.')) {
      await api.delete(`/categories/${id}`);
      fetchData();
    }
  };

  const deleteItem = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await api.delete(`/menu-items/${id}`);
      fetchData();
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="mt-4 font-bold text-secondary">جاري تحميل المنيو...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">قائمة المنيو</h2>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={fetchData}><span className="material-icons-round">refresh</span></button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setEditingCat(null); setShowCatForm(true); }}>+ إضافة تصنيف</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingItem(null); setShowItemForm(true); }}>+ إضافة منتج</button>
        </div>
      </div>

      {showCatForm && <CategoryForm editItem={editingCat} onSaved={() => { setShowCatForm(false); fetchData(); }} onCancel={() => setShowCatForm(false)} />}
      {showItemForm && <ItemForm categories={categories} editItem={editingItem} onSaved={() => { setShowItemForm(false); fetchData(); }} onCancel={() => setShowItemForm(false)} />}

      <div className="grid cols-3 gap-4">
        {categories.map(cat => {
          const catItems = items.filter(i => String(i.category_id) === String(cat.id));
          return (
            <div key={cat.id} className="card">
              <div className="card-header p-4 flex justify-between items-center" style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <h3 className="font-bold">{cat.name}</h3>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" style={{ padding: 4 }} onClick={() => { setEditingCat(cat); setShowCatForm(true); }}><span className="material-icons-round" style={{ fontSize: 18 }}>edit</span></button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: 4, color: 'var(--color-error)' }} onClick={() => deleteCat(cat.id)}><span className="material-icons-round" style={{ fontSize: 18 }}>delete</span></button>
                </div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {catItems.length === 0 ? <p className="p-4 text-xs text-muted">لا توجد منتجات.</p> : (
                  catItems.map((item, i) => (
                    <div key={item.id} style={{ padding: '12px 20px', borderBottom: i < catItems.length - 1 ? '1px solid var(--color-border-light)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.image && (
                        <img src={`http://${window.location.hostname}:8000/storage/${item.image}`} style={{ width: 40, height: 40, objectFit: 'cover' }} alt="" />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-xs text-secondary">₪{item.price}</div>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm" style={{ padding: 4 }} onClick={() => { setEditingItem(item); setShowItemForm(true); }}><span className="material-icons-round" style={{ fontSize: 16 }}>edit</span></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 4 }} onClick={() => deleteItem(item.id)}><span className="material-icons-round" style={{ fontSize: 16 }}>delete</span></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
