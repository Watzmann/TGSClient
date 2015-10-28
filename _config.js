/*
 * Client code for TigerGammonServer HTML5 Client
 *
 * This file is licensed under the Affero General Public License
 * version 3 or later; see LICENSE
 *
 * @author Andreas Hausmann <andreas@tigergammon.com>
 * @copyright Andreas Hausmann 2015
 *
 * config.js contains the configuration of TigerGammon Client.
 * Since config.js would be overwritten with each 'git pull'
 * the config file saved to the git repository is _config.js.
 *
 * To get a valid config file for distribution of this client,
 * create a copy of _config.js named config.js and edit it
 * to your needs. index.html will then load config.js to
 * read the applicable configuration.
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
