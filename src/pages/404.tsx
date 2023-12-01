import Image from 'next/image';
import styles from '../styles/Home.module.scss';

export default function Page404() {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>欢迎使用洞窝客户端</h1>

                <p className={styles.description}>洞窝客户端提供便捷的操作方式。</p>
                <code className={styles.code}>具体请点击左侧菜单查看。</code>
            </main>
        </div>
    );
}
