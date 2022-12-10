# Varuna Map Visualization Module

\
## APIs
`APIs` folder contains the backend api codes. The technology used is `Node.js`. The imported packages are listed in `APIs/package.json` file. The structure of the api is as followed:
<ol>
  <li>`APIs/config` contains the config files for `sequelize` library migration. You can read more about `sequelize` here https://sequelize.org/docs/v6/.</li>
  <li>`APIs/controllers` contains the api controllers.</li>
  <li>`APIs/helpers` contains factored functions that are commonly used within the controllers.</li>
  <li>`APIs/middlewares` contains the api middlewares that authenticate the uses of the api.</li>
  <li>`APIs/migrations` contains the migration files for `sequelize` library.</li>
  <li>`APIs/models` contains the data models.</li>
  <li>`APIs/routes` contains the route files the navigate the api requests to the controllers.</li>
  <li>`APIs/seeders` contains the initial migration data for `sequelize` library.</li>
  <li>`APIs/.env_MAIN` is the template file for setting up the environment variables `.env`.</li>
  <li>`APIs/server.js` is the server file for `Node.js`.</li>
</ol>

\
## Web Application
`Backend` folder contains the web application codes. The technology used is `React.js`. You can read more about it here https://reactjs.org/. The imported packages are listed in `Backend/package.json` file. The structure of the web app is as followed:
<ol>
  <li>`Backend/public` contains public files such as CSS, images and html files.</li>
  <li>`Backend/src` contains the `React` app files which have the structure as followed:
    <ol>
      <li>`actions` folder contains the api request codes.</li>
      <li>`components` folder contains the commonly used `React` components.</li>
      <li>`data` folder contains the static data used in the application.</li>
      <li>`helpers` folder contains factored functions that are commonly used in the application.</li>
      <li>`models` folder contains the data models.</li>
      <li>`reducers` folder contains `React` stste management using `Redux`. You can read more about it here https://redux.js.org/.</li>
      <li>`views` folder contains the application display files.</li>
      <li>`App.js` is the route and setting file for `React`.</li>
    </ol>
  </li>
  <li>`Backend/.env_MAIN` is the template file for setting up the environment variables `.env`.</li>
</ol>

\
## CDN
`CDN` folder contains the cdn codes. The technology used is `Node.js`. The imported packages are listed in `CDN/package.json` file. The structure of the api is as followed:
<ol>
  <li>`CDN/controllers` contains the cdn controllers.</li>
  <li>`CDN/helpers` contains factored functions that are commonly used within the controllers.</li>
  <li>`CDN/middlewares` contains the api middlewares that authenticate the uses of the cdn.</li>
  <li>`CDN/routes` contains the route files the navigate the cdn requests to the controllers.</li>
  <li>`CDN/.env_MAIN` is the template file for setting up the environment variables `.env`.</li>
  <li>`CDN/server.js` is the server file for `Node.js`.</li>
</ol>
