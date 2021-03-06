const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');



app.get('/usuario', function (req, res) {



    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec((err, usuarios) => {

              if (err) {
                return  res.status(400).json({
                  ok: false,
                  err
                });
              }

              Usuario.count({ estado: true }, (err, conteo) => {

                res.json({
                  ok: true,
                  usuarios,
                  cuantos: conteo
                });

              })

              

            })


    //res.json ('get Usuario LOCAL!!!');
  });
  
  app.post('/usuario', function (req, res) {
    let body = req.body; //requerir la inf del POST

    let usuario = new Usuario({
      nombre: body.nombre,
      email: body.email,
      password: bcrypt.hashSync (body.password, 10),
      role: body.role
    });

    usuario.save( (err, usuarioDB) => { //grabar usuario en la DB

      if (err) {
        return  res.status(400).json({
          ok: false,
          err
        });
      }

     // usuarioDB.password = null; forma de ocultar paswword en DB

      res.json({
        ok: true,
        usuario: usuarioDB
      })

    });


  
  });
  

  app.put('/usuario/:id', function (req, res) {
    let id = req.params.id;
    let body = _.pick (req.body, ['nombre','email','img','role','estado'] );


    Usuario.findByIdAndUpdate( id, body, {new: true, runValidators: true }, (err, usuarioDB) => { //new: true; Permite que se visualice en postman la actualizacion del usuario al cambiarlo

      if (err) {
        return  res.status(400).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB
      });

    });
  
    

  });
  
  app.delete('/usuario/:id', function (req, res) {

    let id = req.params.id;
    
    let cambiaEstado = {
      estado: false
    };


    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {



    Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {
      if (err) {
        return  res.status(400).json({
          ok: false,
          err
        });
      };

      if (usuarioBorrado === null) {
        return  res.status(400).json({
          ok: false,
          err: {
            message: 'Usuario no encontrado'
          }
        });
      };

      res.json({
        ok: true,
        usuario: usuarioBorrado
      });


    })
    
  });


  module.exports = app;