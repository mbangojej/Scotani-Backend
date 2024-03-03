import React from "react";


function PaginationLimitSelector(props) {

  const total = props.total;
  const startIndex = (props.currentPage - 1) * props.limit + 1;
  const endIndex = Math.min(startIndex + props.limit - 1, props.total);
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    props.itemsPerPageChange(newItemsPerPage);
  };



  return (
    <>
      { total > 0 &&
      <div className='select-content-wrapper d-flex align-items-center justify-content-between'>
        <h6 className='mb-0'> Showing Records {startIndex} to {endIndex} out of {props.total}
        </h6>
        <select
          value={props.limit}
          onChange={handleItemsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

      </div>
}
    </>
  );
}

export default PaginationLimitSelector;
