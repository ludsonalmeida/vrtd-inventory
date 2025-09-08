// backend/controllers/menuItemController.js
const MenuItem = require('../models/MenuItem');
const Unit = require('../models/Unit');

/** ***************************
 * ADMIN (protegido por JWT)
 *****************************/

// GET /api/menu-items
// Filtros: unitId, section, q (texto), isActive
exports.list = async (req, res) => {
  try {
    const { unitId, section, q, isActive } = req.query;
    const filter = {};
    if (unitId)  filter.unit   = unitId;
    if (section) filter.section = section;
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';

    let query = MenuItem.find(filter).sort({ displayOrder: 1, createdAt: -1 });

    if (q && q.trim()) {
      query = MenuItem.find({ $text: { $search: q }, ...filter }, { score: { $meta: 'textScore' } })
                      .sort({ score: { $meta: 'textScore' } });
    }

    const items = await query.exec();
    res.json(items);
  } catch (err) {
    console.error('Erro ao listar itens de menu:', err);
    res.status(500).json({ error: 'Erro ao listar itens de menu' });
  }
};

// GET /api/menu-items/:id
exports.getOne = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).exec();
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(item);
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
};

// POST /api/menu-items
exports.create = async (req, res) => {
  try {
    const payload = req.body || {};

    // opcional: cachear nome da unidade
    if (payload.unit && !payload.unitNameCache) {
      const u = await Unit.findById(payload.unit).exec();
      if (u) payload.unitNameCache = u.name;
    }

    payload.createdBy = req.user?._id;
    payload.updatedBy = req.user?._id;

    const created = await MenuItem.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('Erro ao criar item:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Slug já existente nesta unidade' });
    }
    res.status(400).json({ error: 'Erro ao criar item' });
  }
};

// PUT /api/menu-items/:id
exports.update = async (req, res) => {
  try {
    const payload = { ...req.body, updatedBy: req.user?._id };
    // se mudar unidade, atualiza cache
    if (payload.unit && !payload.unitNameCache) {
      const u = await Unit.findById(payload.unit).exec();
      if (u) payload.unitNameCache = u.name;
    }
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, payload, { new: true }).exec();
    if (!updated) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar item:', err);
    res.status(400).json({ error: 'Erro ao atualizar item' });
  }
};

// DELETE /api/menu-items/:id
exports.remove = async (req, res) => {
  try {
    const removed = await MenuItem.findByIdAndDelete(req.params.id).exec();
    if (!removed) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ message: 'Item excluído' });
  } catch (err) {
    console.error('Erro ao excluir item:', err);
    res.status(500).json({ error: 'Erro ao excluir item' });
  }
};

/** ***************************
 * PÚBLICO (sem auth) - para o Cardápio
 *****************************/

// GET /api/menu  (?unitName=... | ?unitId=...)
// Retorna no formato que a sua UI já usa: { items:[], promos:[], chopes:[] }
exports.publicMenu = async (req, res) => {
  try {
    const { unitName, unitId, q } = req.query;

    let unitFilter = {};
    if (unitId) {
      unitFilter = { unit: unitId };
    } else if (unitName) {
      // Busca por nome da unidade (exato). Alternativamente, usar regex case-insensitive.
      unitFilter = { unitNameCache: unitName };
    }

    const baseFilter = { isActive: true, ...unitFilter };

    let query = MenuItem.find(baseFilter).sort({ section: 1, displayOrder: 1, createdAt: -1 });

    if (q && q.trim()) {
      query = MenuItem.find({ $text: { $search: q }, ...baseFilter }, { score: { $meta: 'textScore' } })
                      .sort({ score: { $meta: 'textScore' } });
    }

    const docs = await query.exec();

    // Agrupa por section e mapeia ao shape do front:
    const out = { items: [], promos: [], chopes: [] };

    for (const d of docs) {
      const base = {
        id: d.slug || String(d._id),
        title: d.title,
        subtitle: d.subtitle,
        subtitle2: d.subtitle2,
        price: d.price,
        oldPrice: d.oldPrice,
        image: d.image,
        liked: false,           // a UI lida localmente com favoritos
        abv: d.abv,
        ibu: d.ibu,
        volumeMl: d.volumeMl,
        suggestions: (d.suggestions || []).map(s => ({
          label: s.label,
          priceDelta: s.priceDelta,
          type: s.type,
          isDefault: s.isDefault
        })),
      };
      if (d.section === 'promos') out.promos.push(base);
      else if (d.section === 'chopes') out.chopes.push(base);
      else out.items.push(base);
    }

    res.json(out);
  } catch (err) {
    console.error('Erro ao montar cardápio público:', err);
    res.status(500).json({ error: 'Erro ao buscar cardápio' });
  }
};
