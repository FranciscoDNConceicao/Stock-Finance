import { DataGrid, GridColDef} from '@mui/x-data-grid';
import {dataRowsTable} from '../../../data/DataInitPage'
import React, { useState } from 'react';
import { TableStocksProps } from './interfaces';


let columns: GridColDef[] = [
  { 
    field: 'icon', 
    headerName: '',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    headerAlign: 'center', 
    width: 300,
    renderCell: (params) => <img className="min-w-[30px] max-w-[220px] min-h-[30px] max-h-[35px] rounded-md bg-[#FFFBF5] p-[5px]" src={`images/logos/${params.value}.png`} />
  },
  { 
    field: 'stockName', 
    headerName: 'Stock', 
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px] bold',
    width: 400,
    renderCell: (params) => <div className='flex flex-col'><div className='text-white text-[15px] font-family font-extrabold text-[17px] bold'>{params.value[0]}</div><div className='bg-[white] mt-[5px] font-family p-[2px] w-[fit-content]'>{params.value[1]}</div></div> 
  },
  {
    field: 'priceLast',
    headerName: 'Last Price',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    type: 'number',
    width: 200,
    renderCell: (params) => <div className='text-white text-[15px] font-family font-extrabold'>{params.value}</div>
  },
  {
    field: 'percentage',
    headerName: 'Percentage',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    type: 'number',
    width: 200,
    renderCell: (params) => params.value >= 0 ? <div className='text-green-500 font-family'>+{params.value}%</div> : <div className='text-red-500 font-family'>{params.value}%</div>
  },
  {
    field: 'priceHigh',
    headerName: 'High Price',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    type: 'number',
    width: 200,
  },
  {
    field: 'lastUpdate',
    headerName: 'Last Update',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    headerAlign: 'left',
    type: 'string',
    width: 150
  },
  {
    field: 'actionBuy',
    type: 'actions',
    getActions: () => [
      <div className='flex '>
          <button className='text-green-500 p-[3px] font-family font-bolder border border-green-500 mr-[5px] hover:bg-green-500 hover:text-white'>Buy</button>
          
      </div>
      
    ],
    width: 20
  },

  {
    field: 'actionSelkl',
    type: 'actions',
    getActions: () => [
      <div className='flex '>
          <button className='text-red-500 p-[3px] font-family font-bolder border border-red-500 mr-[5px] hover:bg-red-500 hover:text-white'>Sell</button>
      </div>
      
    ],
    width: 20
  }
];




export default function TableStocks(props: TableStocksProps) {

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 15,
  });



  React.useEffect(() => {
    const fetchActionNextPage = async () => {
      props.actionNextPage(paginationModel.page * paginationModel.pageSize, paginationModel.page * paginationModel.pageSize + paginationModel.pageSize)

    }
    fetchActionNextPage()

  },[paginationModel]);
  return (
        <div>
            <DataGrid 
                rows={props.rows?props.rows:[]}
                columns={columns}
                isRowSelectable={() => {return false}}
                sx={
                  {
                    '.MuiDataGrid-columnSeparator': {
                      display: 'none',
                    },
                    '.MuiDataGrid-cellContent': {
                      color: "white",
                      fontFamily:"Inter, sans-serif",
                      
                    },
                    '.MuiDataGrid-cell':{
                      justifyContent: "left"
                    },
                    '.MuiDataGrid-footerContainer':{
                        color: "white",
                        fontFamily:"Inter, sans-serif",
                    },
                    '.MuiTablePagination-root':{
                        color: "white",
                        fontFamily:"Inter, sans-serif",
                    },
                    '.MuiButtonBase-root':{
                      color: "white"
                    },
                    '.MuiDataGrid-cell:focus': {
                      outline: "none !important"
                    }
                  }
                }
                initialState={{
                  
                }}
                rowSelection={false}
                paginationMode='server'
                pagination
                autoPageSize
                rowCount={400}
                pageSizeOptions={[paginationModel.pageSize]}
                paginationModel={paginationModel}
                disableColumnFilter={true}
                disableColumnMenu={true}

                onPaginationModelChange={setPaginationModel}
                >
                </DataGrid>
        </div>
    )
}