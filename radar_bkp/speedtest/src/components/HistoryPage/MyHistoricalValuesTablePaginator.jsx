import ArrowLeft from '../../assets/icons-simple-left-arrow.png';
import ArrowRight from '../../assets/icons-simple-right-arrow.png';
import {DEFAULT_PAGE_COLOR, DEFAULT_PAGE_SELECTED_COLOR} from "../../utils/colors";

const paginatorStyle = {
  width: 'max-content',
  margin: '35px auto 50px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
}

const regularPageStyle = {
  fontSize: 15,
  marginLeft: 7.5,
  marginRight: 7.5,
  cursor: 'pointer',
  color: DEFAULT_PAGE_COLOR
}

const selectedPageStyle = {
  ...regularPageStyle,
  color: DEFAULT_PAGE_SELECTED_COLOR,
}

const arrowStyle = {
  cursor: 'pointer'
}

const opaqueStyle = {
  opacity: 0.3,
}

const MyHistoricalValuesTablePaginator = ({
  currentPage,
  setCurrentPage,
  pageCount
}) => {

  const getPages = () => {
    let pages = [];
    if(pageCount > 8) {
      // < 1 2 ... 9 10 >
      const distanceToLastPage = pageCount - currentPage;
      if(distanceToLastPage === 3) {
        pages = [currentPage, currentPage + 1, pageCount - 1, pageCount];
      } else if(distanceToLastPage === 2) {
        pages = [currentPage - 1, currentPage, currentPage + 1, pageCount];
      } else if(distanceToLastPage === 1) {
        pages = [currentPage - 2, currentPage - 1, currentPage, pageCount];
      } else if(distanceToLastPage === 0) {
        pages = [currentPage - 3, currentPage - 2, currentPage - 1, pageCount];
      } else {
        pages = [currentPage, currentPage + 1, null, pageCount - 1, pageCount];
      }
    } else {
      for(let i = 0 ; i < pageCount ; i++) {
        pages.push(i + 1);
      }
    }
    return pages.map(page => {
        return page ?
        <p className={'speedtest--p speedtest--bold'} key={page} style={currentPage === page ? selectedPageStyle : regularPageStyle}
           onClick={() => setCurrentPage(page)}
        >
          {page}
        </p> : '...';
      }
    );
  }

  const goBackOnePage = () => {
    if(currentPage > 1) setCurrentPage(currentPage - 1);
  }

  const goForwardOnePage = () => {
    if(currentPage < pageCount) setCurrentPage(currentPage + 1);
  }

  return (
    <div style={paginatorStyle}>
      <img src={ArrowRight}
           width={14}
           height={14}
           alt={'left-arrow'}
           onClick={goBackOnePage}
           style={currentPage === 1 ? opaqueStyle : arrowStyle}
      />
      {getPages()}
      <img src={ArrowLeft}
           width={14}
           height={14}
           alt={'left-arrow'}
           onClick={goForwardOnePage}
           style={currentPage === pageCount ? opaqueStyle : arrowStyle}
      />
    </div>
  )
}

export default MyHistoricalValuesTablePaginator;