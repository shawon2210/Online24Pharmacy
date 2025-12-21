import prisma from '../db/prisma.js';

export const createSavedKit = async (req, res) => {
  try {
    const { name, products } = req.body;
    const userId = req.user.id;

    if (!name || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Kit name and products are required.' });
    }

    const savedKit = await prisma.savedKit.create({
      data: {
        name,
        products,
        userId,
      },
    });

    res.status(201).json(savedKit);
  } catch (error) {
    console.error('Error creating saved kit:', error);
    res.status(500).json({ error: 'Failed to save kit.' });
  }
};

export const getSavedKits = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedKits = await prisma.savedKit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(savedKits);
  } catch (error) {
    console.error('Error fetching saved kits:', error);
    res.status(500).json({ error: 'Failed to fetch kits.' });
  }
};

export const getSavedKitById = async (req, res) => {
  try {
    const { id } = req.params;
    const savedKit = await prisma.savedKit.findUnique({
      where: { id },
    });

    if (!savedKit) {
      return res.status(404).json({ error: 'Saved kit not found.' });
    }

    res.json(savedKit);
  } catch (error) {
    console.error('Error fetching saved kit:', error);
    res.status(500).json({ error: 'Failed to fetch kit.' });
  }
};

export const deleteSavedKit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const savedKit = await prisma.savedKit.findUnique({
      where: { id },
    });

    if (!savedKit) {
      return res.status(404).json({ error: 'Saved kit not found.' });
    }

    if (savedKit.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this kit.' });
    }

    await prisma.savedKit.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting saved kit:', error);
    res.status(500).json({ error: 'Failed to delete kit.' });
  }
};
