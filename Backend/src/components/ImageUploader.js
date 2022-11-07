import PropTypes from 'prop-types';
import { useState, useEffect, useRef, Fragment } from 'react';

import { connect } from 'react-redux';
import { userFileUpload } from '../actions/user.actions';
import { FileModel } from '../models';


function ImageUploader(props) {
  const [images, setImages] = useState([]);
  const inputRef = useRef(null);
  
  const onChangeFile = async (e) => {
    e.preventDefault();
    let res = await props.processFileUpload(e.target.files[0], true);
    if(res){
      if(props.isMultiple) res = [ ...images, res ];
      props.onChangeImage(res);
    }
    if(inputRef && inputRef.current) inputRef.current.value = '';
  };
  const onFileDelete = (e) => {
    e.preventDefault();
    if(selectedIndex!==null){
      if(props.isMultiple){
        let temp = [...images];
        temp.splice(selectedIndex, 1);
        props.onChangeImage(temp);
      }else{
        props.onChangeImage(new FileModel({}));
      }
    }
    onModalToggle();
  };

  const isAddable = () => {
    let temp = true;
    if(!props.isMultiple){
      images.forEach(d => {
        if(d.isValid()) temp = false;
      });
    }
    return temp;
  };
  
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalActive, setModalStatus] = useState(false);
  const onModalToggle = (e=null, d=null) => {
    if(e) e.preventDefault();
    setModalStatus(!isModalActive);
    setSelectedIndex(d);
  };

  /* eslint-disable */
	useEffect(() => {
    setImages([...props.images].map(d => new FileModel(d)));
  }, [props.images]);
  /* eslint-enable */

  return (
    <>
      <div className={`img-uploader ${props.process}`}>
        <div className="scroll-wrapper">
          {images.map((d, i) => (
            <Fragment key={`img_${i}`}>
              {d.isValid()? (
                <div className="img-block">
                  <div className="img-container">
                    {/* <div className="img-bg" style={{ backgroundImage: `url('${d.path}')` }}></div> */}
                    <img src={d.path} alt="Preview" />
                  </div>
                  <div className="img-desc color-dark">
                    <p className="text xxs fw-600">{d.originalname}</p>
                    <p className="text xxxs fw-400 lh-sm">
                      <span className="fw-600">Size :</span> {d.displaySize()}
                    </p>
                  </div>
                  {['create', 'update'].indexOf(props.process) > -1? (
                    <div className="btn-delete" onClick={e => onModalToggle(e, i)}>
                      <em className="fa-solid fa-xmark"></em>
                    </div>
                  ): (<></>)}
                </div>
              ): (<></>)}
            </Fragment>
          ))}
        </div>
        {['create', 'update'].indexOf(props.process) > -1? (
          <div className="btn-wrapper">
            {isAddable()? (
              <div className="img-block btn-upload">
                <em className="fa-solid fa-plus"></em>
                <input
                  type="file" ref={inputRef} 
                  accept="image/png,image/jpeg" onChange={onChangeFile} 
                  required={props.process==='create' && props.required} 
                />
              </div>
            ): (<></>)}
          </div>
        ): (<></>)}
      </div>

      <div className={`popup-container ${isModalActive? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">ยืนยันการลบข้อมูล</h6>
              <div className="btn-close" onClick={onModalToggle}>
                <div className="hamburger active">
                  <div></div><div></div><div></div>
                </div>
              </div>
            </div>
            <div className="popup-body">
              <p className="fw-500">
                กรุณายืนยันการลบข้อของคุณ ข้อมูลไม่สามารถนำกลับมาได้หลังจากถูกลบไปแล้ว
              </p>
            </div>
            <div className="popup-footer">
              <div className="btns mt-0">
                <button type="button" className="btn btn-action btn-p" onClick={onFileDelete}>
                  ยืนยันการลบ
                </button>
                <button type="button" className="btn btn-action btn-default" onClick={onModalToggle}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ImageUploader.defaultProps = {
  process: 'create',
  required: false,
  isMultiple: false,
  images: [],
  onChangeImage: () => {}
};
ImageUploader.propTypes = {
	process: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  isMultiple: PropTypes.bool.isRequired,
  images: PropTypes.array.isRequired,
  onChangeImage: PropTypes.func
};

const mapStateToProps = (state) => ({
	
});

export default connect(mapStateToProps, {
  processFileUpload: userFileUpload
})(ImageUploader);