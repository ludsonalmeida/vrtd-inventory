const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('supplier', 'name')
      .exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name')
      .exec();
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, supplier, avgPrice, description } = req.body;
    const newProduct = new Product({ name, supplier, avgPrice, description });
    const saved = await newProduct.save();
    await saved.populate('supplier', 'name');
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar produto' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, supplier, avgPrice, description } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, supplier, avgPrice, description },
      { new: true, runValidators: true }
    )
      .populate('supplier', 'name')
      .exec();
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar produto' });
  }
};

exports.removeProduct = async (req, res) => {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id).exec();
    if (!removed) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto excluído' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
};
