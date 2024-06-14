import { styled } from '@mui/system';
import {
  TablePagination,
  tablePaginationClasses as classes,
} from '@mui/base/TablePagination';
import { TableNewsRoot } from './interfaces';
import {  useState } from 'react';
import { useNavigate } from '../../router';



export default function TableNews(props: TableNewsRoot) {
    const navigate = useNavigate()
    const [pageNum,setPage] = useState(props.page)
    const pageChange = (event: React.MouseEvent<HTMLButtonElement> | null, page:number) => {
        console.log(event)
        props.pageChange(props.rowperPage * (page), props.rowperPage * (page + 1))     
        setPage(page)
           
    }

    const clickedNews = (id:string) => {
      navigate('/news/:id', { params: { id: id }, replace: true });
      window.scrollTo(0, 0);
    }


    return (
        <div className='w-full p-[20px]'>
            <div className='w-full bg-primary-background text-white font-family rounded border-[2px] bg-secondary-background-color ' >
                <div className='w-full bg-background-color text-white bolder p-[5px] text-[17px] flex justify-center border-b-[2px]' >
                    <span>News of this Company</span>
                </div>
                <table className='w-full'>
                    <tbody className='w-full bg-primary-background text-white bg-secondary-background-color'>
                        {props.dataTable.data.map((row) => (
                            <tr key={row.id} className='border-b-[2px] h-[50px] cursor-pointer hover:bg-background-color' onClick={() => clickedNews(row.id)}>
                                <td className="w-[100%] px-[10px] py-[4px]">
                                    <div className="flex justify-between">
                                        <div>{row.title}</div>
                                        <div>{row.date_published}</div>
                                        
                                    </div>
                                    <div className="text-[13px] text-[white] font-thin">
                                        {row.author}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className='w-full bg-background-color border-t-[2px]' > 
                        <tr>
                            <CustomTablePagination
                                    count={props.dataTable.num_Rows}
                                    rowsPerPageOptions={[props.rowperPage]}
                                    onPageChange={pageChange}
                                    page={pageNum}
                                    rowsPerPage={props.rowperPage}
                                />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
const CustomTablePagination = styled(TablePagination)
`& .${classes.toolbar} {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  & .${classes.select}{
    display:none;
  }
  & .${classes.selectLabel} {
    margin: 0;
    display: none;
  }

  & .${classes.displayedRows} {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }

  & .${classes.spacer} {
    display: none;
  }

  & .${classes.actions} {
    display: flex;
    gap: 0.25rem;
    margin-right: 20px;
  }
`;