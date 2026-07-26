const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const { auth } = require('../../middlewares/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const projects = await Project.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json(projects);
});

router.post('/', async (req, res) => {
  const { keyword, data } = req.body;
  const project = await Project.create({ userId: req.userId, keyword, data });
  res.status(201).json(project);
});

router.put('/:id', async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

router.delete('/:id', async (req, res) => {
  const result = await Project.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});
module.exports = router;
