require('dotenv').config();
const { sequelize } = require('../viable/db');
const { DataTypes } = require('sequelize');

async function migrate() {
  const q = sequelize.getQueryInterface();
  const cols = await q.describeTable('appointments');

  if (!cols.consultationType) {
    await q.addColumn('appointments', 'consultationType', {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'online',
    });
    console.log('✅ Added consultationType column');
  } else {
    console.log('Column consultationType already exists.');
  }

  await sequelize.close();
}

migrate().catch(e => { console.error(e); process.exit(1); });
