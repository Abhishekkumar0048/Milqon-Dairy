const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
  // Milk
  { name: 'Full Cream Milk', category: 'milk', price: 60, unit: '1L', description: 'Fresh full cream milk from our farm' },
  { name: 'Toned Milk', category: 'milk', price: 50, unit: '1L', description: 'Low fat toned milk, great for daily use' },
  { name: 'Buffalo Milk', category: 'milk', price: 70, unit: '1L', description: 'Rich creamy buffalo milk' },
  { name: 'Cow Milk (A2)', category: 'milk', price: 80, unit: '1L', description: 'Pure A2 desi cow milk' },

  // Paneer
  { name: 'Fresh Paneer', category: 'paneer', price: 80, unit: '200g', description: 'Soft homemade paneer' },
  { name: 'Malai Paneer', category: 'paneer', price: 110, unit: '200g', description: 'Extra creamy malai paneer' },

  // Curd
  { name: 'Dahi (Curd)', category: 'curd', price: 40, unit: '500g', description: 'Thick creamy curd' },
  { name: 'Mishti Doi', category: 'curd', price: 55, unit: '400g', description: 'Sweet Bengali style curd' },

  // Ghee
  { name: 'Pure Cow Ghee', category: 'ghee', price: 800, unit: '500ml', description: 'Pure bilona method cow ghee' },
  { name: 'Buffalo Ghee', category: 'ghee', price: 900, unit: '500ml', description: 'Rich buffalo milk ghee' },

  // Butter
  { name: 'White Butter', category: 'butter', price: 120, unit: '200g', description: 'Fresh homemade white butter' },
  { name: 'Salted Butter', category: 'butter', price: 130, unit: '200g', description: 'Lightly salted fresh butter' },

  // Makhan
  { name: 'Desi Makhan', category: 'makhan', price: 150, unit: '200g', description: 'Traditional hand-churned makhan' },
  { name: 'Malai Makhan', category: 'makhan', price: 180, unit: '200g', description: 'Soft creamy malai makhan' },

  // Lassi
  { name: 'Sweet Lassi', category: 'lassi', price: 40, unit: '300ml', description: 'Chilled sweet lassi with cream' },
  { name: 'Salted Lassi', category: 'lassi', price: 35, unit: '300ml', description: 'Refreshing salted lassi' },
  { name: 'Mango Lassi', category: 'lassi', price: 55, unit: '300ml', description: 'Thick mango flavored lassi' },
  { name: 'Rose Lassi', category: 'lassi', price: 50, unit: '300ml', description: 'Fragrant rose lassi with dry fruits' },

  // Chach (Buttermilk)
  { name: 'Masala Chach', category: 'chach', price: 25, unit: '250ml', description: 'Spiced buttermilk with jeera & mint' },
  { name: 'Plain Chach', category: 'chach', price: 20, unit: '250ml', description: 'Light refreshing plain buttermilk' },

  // Peda
  { name: 'Milk Peda', category: 'peda', price: 200, unit: '250g (10 pcs)', description: 'Traditional soft milk peda' },
  { name: 'Kesar Peda', category: 'peda', price: 250, unit: '250g (10 pcs)', description: 'Saffron flavored premium peda' },
  { name: 'Chocolate Peda', category: 'peda', price: 220, unit: '250g (10 pcs)', description: 'Fusion chocolate milk peda' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded for Milqon Dairy!`);
  process.exit();
}).catch(err => { console.error(err); process.exit(1); });
