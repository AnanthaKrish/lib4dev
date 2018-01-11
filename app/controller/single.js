const Single = require('../model/single');
const Home = require('../model/home');
const api = require('../config/api_endpoint');
const constant = require('../constant/index');
const showdown = require('showdown');
const common = require('../utils/common');
const converter = new showdown.Converter();

let init = async (req, res, next) => {
  let owner = req.params.owner;
  let topic = req.params.topic;
  let repoId = req.params.id;
  let locals = req.app.locals;
  locals.numberKFormatter = common.numberKFormatter;
  try {
    let reposInfo = '';
    let url = `${api.repoInfo.endPoint}/${owner}/${topic}/readme`;
    let getReposList = Home.getReposList();
    reposInfo = common.getFilterRepoById(repoId, getReposList);
    if (!(reposInfo && reposInfo.length)) {
      let url = common.constructHomeApiEndPoint(req);
      let response = await Single.fetchReposList(url);
      reposInfo = common.getFilterRepoById(repoId, response);
    }
    let response = await Single.init(url);
    if (typeof response === 'string') {
      content = converter.makeHtml(response);

      let pageData = {
        topic: topic || '',
        searchTerm: req.query.search || '',
        reposInfo: reposInfo[0],
        content: content,
        languages: constant.language,
        tags: constant.tags
      };
      res.render('single', pageData);
    } else if(response.status === 404) {
      let pageData = {
        searchTerm: req.query.search || '',
        reposInfo: reposInfo[0],
        topic: topic,
        content: response.data.message,
        languages: constant.language,
        tags: constant.tags
      };
      res.render('single', pageData);
    } else {
      let pageData = {
        searchTerm: req.query.search || '',
        topic: topic,
        languages: constant.language,
        tags: constant.tags
      };
      res.render('not-found/index', pageData);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  init
};
