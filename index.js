require('dotenv').config();

const _ = require('lodash');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const xlsx = require('xlsx');
const logUpdate = require('log-update');

const rumer = require(`${process.env.PATH_RUMER_FUNCTION}`);
const db = require(`${process.env.PATH_DB}`);

const DHIS2_SERVER_URL = process.env.DHIS2_SERVER_URL;
const DHIS2_USERNAME = process.env.DHIS2_USERNAME;
const DHIS2_PASSWORD =  process.env.DHIS2_PASSWORD;

const frames = ['-', '\\', '|', '/'];
let index = 0;

async function formatData(startDate, endDate, depot) {
  try {
    const pathLink = path.join(__dirname, './list_medicament_colonne_dhis2.xls');
    const wb = xlsx.readFile(pathLink);
    const ws1 = wb.SheetNames[0];
    const ws2 = wb.SheetNames[1];
    const listInventory = _.uniqBy(xlsx.utils.sheet_to_json(wb.Sheets[ws1]), 'DE_UID');
    const colonnes = xlsx.utils.sheet_to_json(wb.Sheets[ws2]);
    const result = [];

    await depot.reduce(async (promise, item) => {
      await promise;
      const data = await rumer.getData({
        depot_uuid : item.uuid,
        start_date : startDate,
        end_date : endDate,
        condensed_report : 1,
      });
      const period = moment(startDate).format('YYYY-MM-DD').split('-');
      if (data.data.configurationData.length > 0) {
        data.data.configurationData.forEach((field) => {
          listInventory.forEach((inv) => {
            if (inv.DE_NAME === field.inventoryText) {
              colonnes.forEach((col) => {
                if (col.label === 'quantityOpening') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.quantityOpening,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });
                }
                if (col.label === 'quantityEnding') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.quantityEnding,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });
                }
                if (col.label === 'outQuantityConsumption') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.outQuantityConsumption,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });
                }

                if (col.label === 'quantityTotalEntry') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.quantityTotalEntry,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });

                }
                if (col.label === 'quantityTotalExit') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.quantityTotalExit,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });
                }
                if (col.label === 'outQuantityExit') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.outQuantityExit,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });
                }
                if (col.label === 'numStockOutDays') {
                  result.push({
                    period: `${period[0]}${period[1]}`,
                    orgUnit: item.dhis2_uid,
                    dataElement: inv.DE_UID,
                    categoryOptionCombo: col.uids,
                    value: field.numStockOutDays,
                    storedBy: 'BHIMA SYSTEM',
                    lastUpdated: moment(new Date()).format('YYYY-MM-DD'),
                    comment: '',
                    deleted: null,
                    followup: false,
                  });
                }
              });
            }
          });
        });
      }
    }, Promise.resolve());
    return _.uniqWith(result, _.isEqual);
  } catch (error) {
    throw error;
  }
}

async function importToDhis2(data) {
  try {
    const form = {
      dataValues : data,
    };
    fs.writeFileSync('./dhis2.json', JSON.stringify(form));
    const response = await axios.post(
      `${DHIS2_SERVER_URL}/api/dataValueSets?async=true&skipAudit=true`,
      form,
      {
        auth : {
          username : DHIS2_USERNAME,
          password : DHIS2_PASSWORD,
        },
      },
    );

    console.log('Importation des données réussie:', response.data);
  } catch (error) {
    console.error(
      'Erreur lors de l\'importation des données sur DHIS2:',
      error.message,
    );
    throw error;
  }
}

/**
 * @method main
 * @description This script allows you to send data from rumer bhima to
 *  dhis2 for all the structures that are linked
 */
async function main() {
  const sql = `SELECT * FROM depot WHERE dhis2_uid IS NOT NULL;`;
  const log = logUpdate.createLogUpdate(process.stdout);

  setInterval(() => {
    const frame = frames[(index = ++index % frames.length)];
    log(`${frame} please wait`);
  }, 80);
  log.done('Data import in progress...');
  try {
    const depots = await db.exec(sql);
    const startDate = process.env.START_DATE;
    const endDate = process.env.END_DATE;
    const data = await formatData(startDate, endDate, depots);
    await importToDhis2(data);
    log.clear();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();