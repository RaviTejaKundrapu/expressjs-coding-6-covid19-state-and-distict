const express = require('express')

const app = express()
module.exports = app
module.exports = app
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'covid19India.db')

let db = null

const initializeServerAndDb = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (error) {
    console.log(`Db Error: ${error.message}`)
    process.exit(1)
  }
}

initializeServerAndDb()

//API 1

const convertApi1KeysCases = eachstate => {
  return {
    stateId: eachstate.state_id,
    stateName: eachstate.state_name,
    population: eachstate.population,
  }
}

app.get('/states/', async (request, response) => {
  const getAllstatesQuery = `SELECT * FROM state;`
  const api_1_Db = await db.all(getAllstatesQuery)
  response.send(api_1_Db.map(each => convertApi1KeysCases(each)))
})

//API 2

const convertApi2KeysCases = eachstate => {
  return {
    stateId: eachstate.state_id,
    stateName: eachstate.state_name,
    population: eachstate.population,
  }
}

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getSearchstateQuery = `SELECT * FROM state WHERE state_id=${stateId};`
  const api_2_Db = await db.get(getSearchstateQuery)
  response.send(convertApi2KeysCases(api_2_Db))
})

//API 3
app.post('/districts/', async (request, response) => {
  const districtsUserGivenDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} =
    districtsUserGivenDetails
  const insertDistrictQuery = `
  INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
  VALUES(
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  );`
  await db.run(insertDistrictQuery)
  response.send('District Successfully Added')
})

//API 4

const convertApi4KeysCases = eachdistrict => {
  return {
    districtId: eachdistrict.district_id,
    districtName: eachdistrict.district_name,
    stateId: eachdistrict.state_id,
    cases: eachdistrict.cases,
    cured: eachdistrict.cured,
    active: eachdistrict.active,
    deaths: eachdistrict.deaths,
  }
}

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getSearchDistrictQuery = `SELECT * FROM district WHERE district_id=${districtId};`
  const api_4_Db = await db.get(getSearchDistrictQuery)
  response.send(convertApi4KeysCases(api_4_Db))
})

// API 5

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteTargetDistrictQuery = `DELETE FROM district WHERE district_id=${districtId};`
  await db.run(deleteTargetDistrictQuery)
  response.send('District Removed')
})

//API 6

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtUpdateDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} =
    districtUpdateDetails
  const districtUpdateQuery = `UPDATE district SET 
district_name='${districtName}',
state_id=${stateId},
cases=${cases},
cured=${cured},
active=${active},
deaths=${deaths}`

  await db.run(districtUpdateQuery)
  response.send('District Details Updated')
})

//API 7

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const statsQuery = `SELECT
  SUM(cases),
  SUM(cured),
  SUM(active),
  SUM(deaths)
  FROM district 
  WHERE state_id=${stateId};`
  const stats = await db.get(statsQuery) // returns 1 object because, used get() here
  response.send({
    totalCases: stats['SUM(cases)'], // using OBJ Bracket Notatioon
    totalCured: stats['SUM(cured)'],
    totalActive: stats['SUM(active)'],
    totalDeaths: stats['SUM(deaths)'],
  })
})

//Api 8

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getStateNameQuery = `SELECT state.state_name as stateName
  FROM state INNER JOIN district ON state.state_id=district.state_id
  WHERE district.district_id=${districtId};`
  const api_8_Db = await db.get(getStateNameQuery)
  response.send(api_8_Db)
})
