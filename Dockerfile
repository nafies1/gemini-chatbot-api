# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
# This allows us to install dependencies first, leveraging Docker's layer caching
# If package.json or package-lock.json don't change, this layer won't be rebuilt
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on (default for Express is 3000)
EXPOSE 3000

# Define the command to run your app
# The `npm start` script in your package.json should start your Express server
CMD [ "npm", "start" ]
