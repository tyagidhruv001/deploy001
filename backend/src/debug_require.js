
try {
    console.log('Requiring express...');
    const express = require('express');
    console.log('Requiring cors...');
    const cors = require('cors');
    console.log('Configuring dotenv...');
    require('dotenv').config();
    console.log('Requiring firebase config...');
    require('./config/firebase');
    console.log('Requiring app...');
    const app = require('./app');
    console.log('All required successfully!');
} catch (e) {
    console.error('FAILED TO REQUIRE:');
    console.error(e);
}
