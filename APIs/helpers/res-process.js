
const resProcess = {
  '200': (res, data=true, msg='Success.') => {
    if(res){
      return res.status(200).send({
        message: msg,
        data: data
      });
    }else{
      return {
        status: 200,
        message: msg,
        data: data
      };
    }
  },
  '400': (res, err, msg='There is an error.') => {
    if(res){
      return res.status(400).send({
        message: msg,
        error: err
      });
    }else{
      return {
        status: 400,
        message: msg,
        error: err
      };
    }
  },
  '500': (res, err) => {
    console.log(err);
    if(res){
      return res.status(500).send({
        message: 'Internal server error.',
        error: {
          system: `${err}`
        }
      });
    }else{
      return {
        status: 500,
        message: 'Internal server error.',
        error: { system: `${err}` }
      };
    }
  },
  'checkError': (res, err, msg='There is an error.') => {
    if(Object.keys(err).length){
      if(res){
        return res.status(400).send({
          message: msg,
          error: err
        });
      }else{
        return {
          status: 400,
          message: msg,
          error: err
        };
      }
    }
  }
};

module.exports = resProcess;