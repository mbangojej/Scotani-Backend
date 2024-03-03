# Scotani - Admin Dashboard

## Requirements

You don’t need to install or configure tools like webpack or Babel.
They are preconfigured and hidden so that you can focus on the code.

You’ll need to have Node 14.0.0 or later version on your local development machine (but it’s not required on the server). You can use nvm (macOS/Linux) or nvm-windows to switch Node versions between different projects.

## Check Node Version 

Check version with this command:

node -v 

Version should be 14.0.0 or later version on your local

## Install Packages 

At the root directory of the application, run the following command to install packages:

npm install

## Configure app

Add .env file at root of the project. Sample values available in .env.example file.

## Run Project

Start running project with following command:

npm start

This will start the project on 3000 PORT if available, otherwise the next available port (3001, 3002, 3003 and so on) will be picked up automatically. 

Open http://localhost:3000 to view it in the browser.

The page will automatically reload if you make changes to the code.

## Make Production Build

When you’re ready to deploy to production, create a minified bundle with:

npm run build

It builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

