require('dotenv').config();
const { sequelize } = require('../viable/db');
const { DataTypes } = require('sequelize');

async function migrate() {
  const q = sequelize.getQueryInterface();

  const tables = await q.showAllTables();
  if (tables.includes('patient_notifications')) {
    console.log('Table patient_notifications already exists.');
    await sequelize.close();
    return;
  }

  await q.createTable('patient_notifications', {
    id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId:     { type: DataTypes.INTEGER, allowNull: false },
    type:          { type: DataTypes.STRING(50), allowNull: false },
    title:         { type: DataTypes.STRING, allowNull: false },
    message:       { type: DataTypes.TEXT, allowNull: false },
    appointmentId: { type: DataTypes.INTEGER, allowNull: true },
    isRead:        { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  console.log('✅ Created patient_notifications table');
  await sequelize.close();
}

migrate().catch(e => { console.error(e); process.exit(1); });
