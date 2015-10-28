/*
 * Client code for TigerGammonServer HTML5 Client
 *
 * (c) Andreas Hausmann
 * Licensed under AGPL3; see LICENSE
 *
 *
 * config.js contains the configuration of TigerGammon Client.
 * Since config.js will be overwritten with each 'git pull'
 * the config file read by the client is _config.js.
 *
 * To get a valid config file for distribution of this client,
 * create a copy of config.js named _config.js and edit it
 * to your needs. index.html will then load _config.js to
 * read the configuration.
 *
*/

function loadConfig() {
  var tgcConfig = (function() {
    return {
        HOST_PORT: {//'server1': "192.168.1.1:8001",
                    //'server2': "192.168.1.2:8001",
                    'localhost': "127.0.0.1:8001",
                    //'TGS': "tigergammon.com:8080"
        }
    };
  }());
  window.tgcConfig = tgcConfig;
};
