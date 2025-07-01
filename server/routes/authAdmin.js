import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



const router = express.Router();

const adminUser = {
  email: 'admin@gmail.com',
  passwordHash: bcrypt.hashSync('admin123', 10), // hashed password
};

const SECRET = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== adminUser.email) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = bcrypt.compareSync(password, adminUser.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: '1d' });
  res.json({ token });
});

export default router;
