"use strict";
const express = require('express');
const cart = express.Router();
const pool = require('./connection');

function getTable(filters) {
    let tableFilters = {...filters};
    let query = "SELECT * FROM shopping_cart";
    let where = [];
    let params = [];
    if (tableFilters.id) {
        params.push(tableFilters.id);
        where.push(`id = $${params.length}::integer`);
    }
    if (tableFilters.maxPrice) {
        params.push(tableFilters.maxPrice);
        where.push(`price <= $${params.length}::integer`)
    }
    if (tableFilters.prefix) {
        tableFilters.prefix += '%';
        params.push(tableFilters.prefix);
        where.push(` product LIKE $${params.length}::character varying`)
};

cart.get("/", (req,res)=>{
    let filter = {};
    filter.maxPrice = req.query.maxPrice;
    filter.prefix = req.query.prefix;
    filter.pageSize = req.query.pageSize;
    getTable(filter).then(result=>{
        res.status(200);
        res.json(result.rows);
    }).catch(error=>{
        console.log(error);
        res.sendStatus(500);
    });
});
cart.get("/:id", (req,res)=>{       
            res.status(200);
})

cart.post("/", (req,res)=>{
    if (req.body && req.body.product && req.body.price && req.body.quantity) {
        let values = [
            req.body.product,
            req.body.price,
            req.body.quantity
        ];
        let item = {
            product: values[0],
            price: values[1],
            quantity: values[2]
        }
        pool.query("INSERT INTO shopping_cart (product, price, quantity) VALUES ($1::text, $2::numeric, $3::numeric)", values)
        .then(()=>{
            res.status(201);
            res.json(item);
        }
        ).catch(error=>{
            console.log(error);
            res.sendStatus(500);
        })
    }
});
cart.delete("/:id", (req,res)=>{  
            res.sendStatus(500);
});
cart.put("/:id", (req,res)=>{
    if (req.body && req.body.product && req.body.price && req.body.quantity) {
        let values = [
            req.params.id,
            req.body.product,
            req.body.price,
            req.body.quantity
        ]
        let item = {
            product: values[1],
            price: values[2],
            quantity: values[3]
        }
        pool.query("UPDATE shopping_cart SET product=$2::text, price=$3::numeric, quantity=$4::numeric WHERE id=$1::numeric ORDER BY id ASC", values).then(result=>{
            res.status(200);
            res.json(item);
        }).catch(error=>{
            console.log(error);
            res.sendStatus(500);
        });
    }
});

module.exports = cart;