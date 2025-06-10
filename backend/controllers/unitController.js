// backend/controllers/unitController.js

const Unit = require('../models/Unit');

/**
 * GET /api/units
 * Retorna todas as unidades (ordenadas por nome).
 */
async function getAllUnits(req, res) {
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.json(units);
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    res.status(500).json({ error: 'Erro ao buscar unidades' });
  }
}

/**
 * GET /api/units/:id
 * Retorna uma unidade específica pelo ID.
 */
async function getUnitById(req, res) {
  try {
    const { id } = req.params;
    const unit = await Unit.findById(id);
    if (!unit) return res.status(404).json({ error: 'Unidade não encontrada' });
    res.json(unit);
  } catch (error) {
    console.error('Erro ao buscar unidade:', error);
    res.status(500).json({ error: 'Erro ao buscar unidade' });
  }
}

/**
 * POST /api/units
 * Cria uma nova unidade de medida (nome + descrição + iconName).
 */
async function createUnit(req, res) {
  // Opcional: log para ver o corpo exato que está chegando
  console.log('POST /api/units → req.body =', req.body);

  try {
    const { name, description, iconName } = req.body;

    // Validações básicas (o express-validator já garantiu que name/iconName não estejam vazios)
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da unidade é obrigatório' });
    }
    if (!iconName || !iconName.trim()) {
      return res.status(400).json({ error: 'Ícone da unidade é obrigatório' });
    }

    // Verifica se já existe outra unidade com o mesmo nome
    const exists = await Unit.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ error: 'Já existe uma unidade com este nome' });
    }

    const unit = new Unit({
      name: name.trim(),
      description: description ? description.trim() : '',
      iconName: iconName.trim(),
    });
    const saved = await unit.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    res.status(500).json({ error: 'Erro ao criar unidade' });
  }
}

/**
 * PUT /api/units/:id
 * Atualiza uma unidade por ID (pode alterar o iconName também).
 */
async function updateUnit(req, res) {
  const { id } = req.params;
  const { name, description, iconName } = req.body;

  try {
    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da unidade é obrigatório' });
    }
    if (!iconName || !iconName.trim()) {
      return res.status(400).json({ error: 'Ícone da unidade é obrigatório' });
    }

    // Verifica duplicata de nome entre unidades diferentes
    const other = await Unit.findOne({ name: name.trim(), _id: { $ne: id } });
    if (other) {
      return res.status(400).json({ error: 'Outra unidade com este nome já existe' });
    }

    const updates = {
      name: name.trim(),
      description: description ? description.trim() : '',
      iconName: iconName.trim(),
    };

    const updated = await Unit.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar unidade:', error);
    res.status(500).json({ error: 'Erro ao atualizar unidade' });
  }
}

/**
 * DELETE /api/units/:id
 * Remove uma unidade por ID.
 */
async function deleteUnit(req, res) {
  try {
    const { id } = req.params;
    const removed = await Unit.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    res.json({ message: 'Unidade removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover unidade:', error);
    res.status(500).json({ error: 'Erro ao remover unidade' });
  }
}

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};
