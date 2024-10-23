import pg from 'pg';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import critical_data from '../../shared_data/server_critical_data.js';

const baldwin_web_db = new pg.Pool({
  host: critical_data.DATABASE_HOST,
  user: critical_data.DATABASE_USER,
  max: 30,
  password: critical_data.DATABASE_PW,
  database: critical_data.CODE_NOTES_DATABASE
});

const splice_log_db = new pg.Pool({
  host: critical_data.DATABASE_HOST,
  user: critical_data.DATABASE_USER,
  max: 30,
  password: critical_data.DATABASE_PW,
  database: critical_data.SPLICE_LOG_DATABASE
});

async function get_info_from_db(response) {
  const client = await baldwin_web_db.connect();
  try {
    const result = await client.query('SELECT id, uuid, title FROM code_notes.codes'); // example query
    
    const data = {}
    result.rows.forEach((row) => {
      const _title = row.title;
      if (!data[_title]) data[_title] = [];
      data[_title].push(row)
    })

    
    if (response) response.json(data);
  } catch (err) {
    console.error('Query failed', err);
    throw err;
  } finally {
    client.release();
  }
}

async function get_info_of_selectedCode_from_db(response, id, uuid) {
  const client = await baldwin_web_db.connect();
  try {
    
    // Use parameterized queries to avoid SQL injection and formatting issues
    const query = `SELECT * FROM code_notes.codes WHERE id = $1 AND uuid = $2`;
    
    // Execute the query with parameters
    const result = await client.query(query, [parseInt(id, 10), uuid]);

    if (response) response.json(result.rows[0]);
  } catch (err) {
    console.error('Query failed', err);
    throw err;
  } finally {
    client.release();
  }
}

async function transfer_info_to_db(data) {
  const client = await baldwin_web_db.connect();
  try {
    setTimeout(() => {
      const escapeString = (str) => str.replace(/'/g, "''");
      const result = client.query(`INSERT INTO code_notes.codes (uuid, code, comment, title, date_time_infosaved) VALUES ('${data.uuid}', '${escapeString(data.code)}', '${escapeString(data.comment)}', '${data.title}', '${data.date}')`);
    }, 1)

  } catch (err) {
    console.error('Transfer to database failed', err);
    throw err;
  } finally {
    client.release();
  }
}

async function remove_item_from_db(response, id, uuid) {
  const client = await baldwin_web_db.connect();
  try {
    
    // Use parameterized queries to avoid SQL injection and formatting issues
    const query = `DELETE FROM code_notes.codes WHERE id = $1 AND uuid = $2`;
    
    // Execute the query with parameters
    const result = await client.query(query, [parseInt(id, 10), uuid]);

    if (response) console.log('remove success');
  } catch (err) {
    console.error('Query failed', err);
    throw err;
  } finally {
    client.release();
  }
}

async function get_splice_logs_from_db(response){
  const client = await splice_log_db.connect();

  try
  {
    const result = await client.query(`SELECT id, station_id, splicer_sn, date_time_splicecompleted FROM splice_log.completed_splice`);

    const splice_log_data = {};
    result.rows.forEach((row, index) => {
      // check existance of index from splcie_log_data object
      if (!splice_log_data[`${index}`]) splice_log_data[`${index}`] = [];
      
      splice_log_data[`${index}`].push(row);
    })

    if (response) response.json(splice_log_data);
  }
  catch (err)
  {
    if (response) response.send(`Failed to get data of splice log ${err.stack}`);
      console.error('Error fetching the data from database', err.stack);
  }

  client.release();
}

async function get_splice_logs_img_from_db(response, selected_id){
  const client = await splice_log_db.connect();

  try
  {
    if (!selected_id) return;
    
    const result = await client.query(`SELECT * FROM splice_log.completed_splice WHERE id = ${selected_id}`);
    const splice_log_data = {};
    result.rows.forEach((row, index) => {
      // check existance of index from splcie_log_data object
      if (!splice_log_data[`${index}`]) splice_log_data[`${index}`] = [];
      
      splice_log_data[`${index}`].push(row);
    })

    if (response) response.json(splice_log_data);
  }
  catch (err)
  {
    if (response) response.send(`Failed to get data of splice log ${err.stack}`);
      console.error('Error fetching the data from database', err.stack);
  }

  client.release();
}

function unzip_images() {
  
}

function baldwin_web_router1(app) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, val => val);
  pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, val => val);

  app.get('/api/get_info_from_db', async (req, res) => {
    get_info_from_db(res);
  });

  app.get('/api/get_info_of_selectedCode_from_db/:id/:uuid', async (req, res) => {
    const { id, uuid } = req.params;
    get_info_of_selectedCode_from_db(res, id, uuid);
  });

  app.post('/api/transfer_info_to_db', async (req, res) => {
    const data = req.body;
    transfer_info_to_db(data);
  })

  app.post('/api/remove_item_from_db/:id/:uuid', async (req, res) => {
    const { id, uuid } = req.params;
    remove_item_from_db(req, id, uuid);
  })

  app.get('/api/get_splice_logs_from_db', (req, res) => {
    get_splice_logs_from_db(res);
  });
  
  app.get('/api/get_splice_logs_img_from_db/:id', (req, res) => {
    const { id } = req.params;

    get_splice_logs_img_from_db(res, id);
  });

  
  app.use(express.static(path.join(__dirname, '../routes/static/build_baldwin_web_app_1/')));
}

export default baldwin_web_router1;
