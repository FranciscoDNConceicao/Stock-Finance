import * as React from 'react';
import { styled } from '@mui/system';
import {
  TablePagination,
  tablePaginationClasses as classes,
} from '@mui/base/TablePagination';
import { NewsCompany, TableNewsRoot } from './interfaces';



export default function TableNews(props: TableNewsRoot) {

    const pageChange = () => {
        props.pageChange(props.rowperPage * props.page, props.rowperPage * props.page + 1)
    }

    return (
        <div className='w-full p-[20px]'>
            <div className='w-full bg-primary-background text-white font-family rounded border-[2px] bg-secondary-background-color ' >
                <div className='w-full bg-primary-background text-white bolder p-[5px] text-[17px] flex justify-center border-b-[2px]' >
                    <span>News of this Company</span>
                </div>
                <table className='w-full'>
                    <tbody className='w-full bg-primary-background text-white bg-secondary-background-color'>
                        {props.data.map((row) => (
                            <tr key={row.id}>
                                <td className="w-[30%]">
                                    {row.url_image}
                                </td>
                                <td className="w-[100%]">
                                    <div>
                                        {row.title}
                                    </div>
                                    <div>
                                        {row.author}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className='w-full style={{  background: `#${props.color}`}} border-t-[2px]' > 
                        <CustomTablePagination
                            count={props.CountRows}
                            rowsPerPageOptions={[props.rowperPage]}
                            onPageChange={pageChange}
                            page={props.page}
                            rowsPerPage={props.rowperPage}
                        />
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