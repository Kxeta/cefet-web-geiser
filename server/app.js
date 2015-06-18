var express = require('express'),
    app = express();

var _ = require('underscore');

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
fs = require('fs');
var jogadores = JSON.parse(fs.readFileSync(__dirname + '/data/jogadores.json'));
var jogosxjogadores = JSON.parse(fs.readFileSync(__dirname + '/data/jogosPorJogador.json'));
var db = _.extend({}, JSON.parse(fs.readFileSync(__dirname + "/data/jogadores.json")),
    JSON.parse(fs.readFileSync(__dirname + "/data/jogosPorJogador.json")));


// configurar qual templating engine usar.
app.set('view engine', 'hbs');


// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
app.set('views', 'server/views');

// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
app.get('/',function (req, res) {
    res.render('index',db, function(err, html) {
                                  res.send(html);
                                });
});
app.get('/jogador/:id/',function (req, res) {
    var jogador = _.find(db.players, function (el) { return el.steamid == req.params.id; });
    var games = _.map(_.sortBy(db[req.params.id].games, function (g) { return -g.playtime_forever; }), function (game) {
        return {
            appid: game.appid,
            name: game.name,
            playtime_forever: game.playtime_forever / 60 | 0,
            img_logo_url: game.img_logo_url
        };
    });;

    res.render('jogador', {
        steamid: jogador.steamid,
        avatar: jogador.avatar,
        personname: jogador.personaname,
        loccountrycode: jogador.loccountrycode,
        realname: jogador.realname,
        profilename: jogador.personaname,
        numOfGames: db[req.params.id].game_count,
        numOfNonPlayedGames: _.where(db[req.params.id].games, { playtime_forever: 0 }).length,
        favoriteGame: games[0],
        topFiveGames: games.slice(0, 5)
    });
});


// configurar para servir os arquivos estáticos da pasta "client"
app.use(express.static('client'));

// abrir servidor
app.listen(3000);
