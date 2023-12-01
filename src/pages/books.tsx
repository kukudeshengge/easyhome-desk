import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';
import { useEffect, useLayoutEffect, useState } from 'react';
import { getBooksApi, IListRow } from '../api/books';
import styles from '../styles/Home.module.scss';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Books() {
    const [show, setShow] = useState(false);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [rows, setRows] = useState<IListRow[]>([]);
    const [bid, setBid] = useState('');

    useEffect(() => {
        setShow(true);
        getlist(page);
    }, [page]);

    function handleChangePage(e: any, page: number) {
        console.log(e, page);
        setPage(page);
    }
    async function getlist(pageindex = 0) {
        try {
            const data = await getBooksApi({
                pageindex,
            });
            if (data?.count) {
                setCount(data.count);
                setRows(data.rows);
            }
        } catch (error) {
            console.log(error);
        }
    }
    function handleClose() {
        setOpen(false);
    }
    function openwindow(id?: string) {
        setOpen(true);
        if (id) setBid(id);
    }
    if (!show) return null;
    return (
        <div>
            <ButtonGroup variant="contained">
                <Button onClick={() => getlist(0)}>查询</Button>
                <Button color="success" onClick={() => openwindow()}>
                    添加
                </Button>
            </ButtonGroup>

            <TableContainer>
                <Table sx={{ minWidth: 700 }} aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell>编号</TableCell>
                            <TableCell>标题</TableCell>
                            <TableCell>封面</TableCell>
                            <TableCell>作者</TableCell>
                            <TableCell>分类</TableCell>
                            <TableCell>最后更新</TableCell>
                            <TableCell>借书人</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.bid}>
                                <TableCell>{row.bid}</TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>
                                    <img className={styles.book_img} src={row.img} alt="" />
                                </TableCell>
                                <TableCell>{row.author}</TableCell>
                                <TableCell>{row.cls}</TableCell>
                                <TableCell>{dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                                <TableCell>{row.operator}</TableCell>
                                <TableCell>
                                    <Button variant="contained" onClick={() => openwindow(row.bid)}>
                                        编辑
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[20]} component="div" count={count} rowsPerPage={(page + 1) * 20} page={page} onPageChange={handleChangePage} />
            <Dialog open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {bid ? '编辑' : '添加'}图书
                        </Typography>
                        <Button autoFocus color="inherit" onClick={handleClose}>
                            关闭
                        </Button>
                    </Toolbar>
                </AppBar>
                <div style={{ width: '500px', height: '500px', overflow: 'hidden' }}>
                    <iframe width="100%" height="100%" src={'https://recorner.jrdaimao.com/book?bid=' + bid}></iframe>
                </div>
            </Dialog>
        </div>
    );
}
