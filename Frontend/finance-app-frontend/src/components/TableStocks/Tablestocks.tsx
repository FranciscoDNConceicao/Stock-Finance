import { DataGrid, GridColDef} from '@mui/x-data-grid';
import { TableStocksProps } from './interfaces';
import React from 'react';


let columns: GridColDef[] = [
  { 
    field: 'icon', 
    headerName: '',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    headerAlign: 'center', 
    width: 200,
    renderCell: (params) => <img className="min-w-[30px] max-w-[130px] min-h-[30px] max-h-[30px] rounded-md bg-[#FFFBF5] p-[5px]" src={`images/logos/${params.value}.png`} />
  },
  
  { 
    field: 'stockName', 
    headerName: 'Stock', 
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px] bold ',
    width: 700,
    renderCell: (params) => <div className='flex flex-col'><div className='text-white text-[15px] font-family font-extrabold text-[17px] bold'>{params.value[0]}</div><div className='bg-[var(--secondary-color)] mt-[5px] font-family p-[4px] w-[fit-content] text-[white] rounded'>{params.value[1]}</div></div> 
  },

  {
    field: 'priceLast',
    headerName: 'Last Price',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] font-family font-extrabold text-[17px]',
    type: 'number',
    width: 200,
    renderCell: (params) => <div><div className='text-white text-[17px] font-family font-extrabold'>{params.value[0]}</div><div className='text-white text-[12px] font-family'>{params.value[1]}</div></div>
  },
  {
    field: 'percentage',
    headerName: 'Percentage',
    headerAlign: 'left',
    headerClassName: 'text-white text-[15px] text-[17px] font-family font-extrabold text-[17px]',
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
    renderCell: (params) => <div><div className='text-white text-[17px] font-family font-extrabold'>{params.value[0]}</div><div className='text-white text-[12px] font-family'>{params.value[1]}</div></div>
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
      <div className='flex'>
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
                disableRowSelectionOnClick
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
                rowHeight={75}
                onPaginationModelChange={setPaginationModel}
                >
                </DataGrid>
        </div>
    )
}