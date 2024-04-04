import { DataGrid, GridColDef} from '@mui/x-data-grid';
import {dataRowsTable} from '../../../data/DataInitPage'
import React from 'react';

let columns: GridColDef[] = [
  { 
    field: 'icon', 
    headerName: '',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    headerAlign: 'center', 
    width: 200,
    renderCell: (params) => <img className="min-w-[30px] max-w-[120px] min-h-[30px] max-h-[35px]" src={`images/logos/${params.value}.png`} />
  },
  { 
    field: 'stockName', 
    headerName: 'Stock', 
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    width: 400},
  
  { 
    field: 'code', 
    headerName: 'Code',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    width: 100
  },
  { 
    field: 'unit', 
    headerName: 'Unit',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    width: 200
  },
  {
    field: 'priceLast',
    headerName: 'Last Price',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    type: 'number',
    width: 200,
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
    type: 'date',
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

export default function TableStocks() {
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 1,
  });
  const [rows, setRows] = React.useState(dataRowsTable);

  
  React.useEffect(() => {
      console.log('CLICOU')
      setRows(rows)
      setPaginationModel(paginationModel)
  }, [paginationModel])
  

  return (
        <div>
            <DataGrid 
                rows={rows}
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
                  rowSelection={false}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 20 },
                    },
                    }}
                    onPaginationModelChange={setPaginationModel}
                >
                </DataGrid>
        </div>
    )
}