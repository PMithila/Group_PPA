export const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: Date.now(),
      filename: req.file.originalname,
      path: req.file.path,
      uploaded_by: req.user.id,
      uploaded_at: new Date().toISOString()
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

export const listUploads = async (req, res) => {
  try {
    const mockUploads = [
      {
        id: 1,
        filename: 'teachers.csv',
        path: '/uploads/teachers-123456789.csv',
        uploaded_by: req.user.id,
        uploaded_at: new Date().toISOString()
      }
    ];
    res.json(mockUploads);
  } catch (error) {
    console.error('List uploads error:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};
