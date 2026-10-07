import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query, pool } from '../src/db.js';

if ((process.env.DB_NAME || 'agriiigo') !== 'agriiigo') throw new Error('Refusing seed unless DB_NAME=agriiigo');
if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed demo records in production.');
const pass = await bcrypt.hash('demo123',12);
const people=[['Ananya Rao','9000000001','farmer1@demo.com','FARMER','Guntur'],['Ravi Kumar','9000000002','farmer2@demo.com','FARMER','Tenali'],['Mahesh Naidu','9000000003','owner1@demo.com','OWNER','Guntur'],['Suresh Reddy','9000000004','owner2@demo.com','OWNER','Tenali']];
for(const [name,phone,email,role,village] of people)await query('INSERT INTO users(name,phone,email,password_hash,role,village,latitude,longitude) VALUES(?,?,?,?,?,?,16.3,80.4) ON DUPLICATE KEY UPDATE name=VALUES(name),phone=VALUES(phone),password_hash=VALUES(password_hash),role=VALUES(role),village=VALUES(village)',[name,phone,email,pass,role,village]);
if(process.env.DEMO_ADMIN_PASSWORD){const adminPass=await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD,12);await query('INSERT INTO users(name,phone,email,password_hash,role,village,latitude,longitude) VALUES(?,?,?,?,?,?,16.3,80.4) ON DUPLICATE KEY UPDATE name=VALUES(name),phone=VALUES(phone),password_hash=VALUES(password_hash),role=VALUES(role),village=VALUES(village)', ['B.Krishna Sai','7032185496','admin@demo.com',adminPass,'ADMIN','Vijayawada']);}
const services=['Ploughing','Cultivation','Harvesting','Transportation','Seeding','Spraying','Land levelling','Other'];for(const name of services)await query('INSERT IGNORE INTO services(name) VALUES(?)',[name]);
const owners=await query("SELECT id,email FROM users WHERE email IN ('owner1@demo.com','owner2@demo.com')");
const items=[
 [owners.find(x=>x.email==='owner1@demo.com').id,'Tractor','Mahindra','575 DI','AP07AB1234',2022,'45 HP','Reliable tractor with operator',16.30,80.44,'Guntur','VERIFIED','Ploughing','PER_ACRE',900],
 [owners.find(x=>x.email==='owner1@demo.com').id,'Rotavator','Mahindra','Gyrovator','AP07AB1235',2021,'6 ft','Rotavator attachment for seedbed preparation',16.31,80.43,'Guntur','VERIFIED','Cultivation','PER_ACRE',1100],
 [owners.find(x=>x.email==='owner1@demo.com').id,'Harvester','Kubota','DC-68G','AP07AB1236',2023,'68 HP','Combine harvester, subject to crop and field conditions',16.32,80.45,'Guntur','PENDING_VERIFICATION','Harvesting','PER_ACRE',2500],
 [owners.find(x=>x.email==='owner2@demo.com').id,'Tractor','John Deere','5310','AP16CD2221',2022,'55 HP','Field-ready tractor with operator',16.24,80.62,'Tenali','VERIFIED','Ploughing','PER_ACRE',1000],
 [owners.find(x=>x.email==='owner2@demo.com').id,'Transportation','Tata','407','AP16CD2222',2020,'2 tonne','Farm produce and input transportation',16.25,80.60,'Tenali','VERIFIED','Transportation','PER_TRIP',1500],
 [owners.find(x=>x.email==='owner2@demo.com').id,'Sprayer','Honda','Power Sprayer','AP16CD2223',2023,'25 L','Crop spraying with operator',16.26,80.61,'Tenali','REJECTED','Spraying','PER_ACRE',350],
 [owners.find(x=>x.email==='owner2@demo.com').id,'Seeder','John Deere','Seed Drill','AP16CD2224',2021,'9 rows','Precision seed drill service',16.27,80.64,'Tenali','VERIFIED','Seeding','PER_ACRE',750]
];
for(const x of items){const [owner,type,brand,model,reg,year,hp,desc,lat,lng,village,status,service,pricing,price]=x;await query(`INSERT INTO equipment(owner_id,equipment_type,brand,model,registration_number,year,hp_or_capacity,description,latitude,longitude,village,verification_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE verification_status=VALUES(verification_status),description=VALUES(description)`,[owner,type,brand,model,reg,year,hp,desc,lat,lng,village,status]);const e=(await query('SELECT id FROM equipment WHERE registration_number=?',[reg]))[0],s=(await query('SELECT id FROM services WHERE name=?',[service]))[0];await query('INSERT INTO equipment_services(equipment_id,service_id,pricing_model,price,minimum_quantity) VALUES(?,?,?,?,1) ON DUPLICATE KEY UPDATE price=VALUES(price)',[e.id,s.id,pricing,price]);}
const verifiedEquipment=await query("SELECT id FROM equipment WHERE verification_status='VERIFIED'");
for(const e of verifiedEquipment){for(let offset=1;offset<=21;offset++){const date=new Date();date.setDate(date.getDate()+offset);if(date.getDay()===0)continue;const day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;await query("INSERT INTO availability(equipment_id,available_date,start_time,end_time,status) VALUES(?,?,'08:00','17:00','AVAILABLE') ON DUPLICATE KEY UPDATE end_time=VALUES(end_time),status='AVAILABLE'",[e.id,day]);}}
const farmer=(await query("SELECT id FROM users WHERE email='farmer1@demo.com'"))[0];await query('INSERT INTO fields(farmer_id,name,latitude,longitude,area_acres,village,notes) SELECT ?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM fields WHERE farmer_id=? AND name=?)',[farmer.id,'North Paddy Field',16.305,80.425,3.5,'Guntur','Demo saved field',farmer.id,'North Paddy Field']);
console.log('Agriiigo demo data is ready. Farmer and owner demo password: demo123');await pool.end();
