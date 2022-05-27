import axios from 'axios';
import { useEffect, useRef,useMemo, useState } from 'react';

import useListMessage, { useSignalSend } from '@src/hooks/useListMessage';
import GroupMessage from './GroupMessage';
import randomChars from 'server/helpers/randomChars';
import InfiniteScroll from '@src/Components/Layout/InfiniteScroll';
import { useGroup } from '@src/hooks/useListGroup';
import { useFetchAuth } from '@src/hooks/useFetchAuth';

import styles from './list-message.module.scss';
import Loading from '@src/Components/Layout/Loading';
const ListMessage = () => {
  const instance = useFetchAuth();
  const listMessage = useListMessage();
  const group = useGroup();
  const signalSend = useSignalSend();
  const divRef = useRef<HTMLDivElement>(null);
  const axiosCancelSource = useRef(axios.CancelToken.source());
  const [count, setCount] = useState(99);
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchMoreData = async (lastId: null | string = null) => {
    setLoading(true);
    const { count: c } = await listMessage.getListMessage(instance, axiosCancelSource.current.token, group.get()._id, lastId) as { count: number };
    setCount(c);
    setLoading(false);
  }

  const lastId = useMemo(() => {
    const length = listMessage.list.length;
    return length ? listMessage.list[0].messages[0]._id.get() : null;
  }, [listMessage]);
  
  useEffect(() => {
    return () => {
      axiosCancelSource.current.cancel();
    }
  }, []);

  useEffect(() => {
    if (divRef.current) {
      if (height === 0) setHeight(divRef.current.scrollHeight);
      else {
        const h = divRef.current.scrollHeight - height;
        divRef.current.scrollTo({ top: h });
        setHeight(divRef.current.scrollHeight);
      }
    }
  }, [divRef.current?.scrollHeight]);

  useEffect(() => {
    if (divRef.current) divRef.current.scrollTo({ top: divRef.current.scrollHeight });
  }, [signalSend]);
  return (
    <div ref={divRef} className={styles.listMessage}>
      <InfiniteScroll
        next={() => fetchMoreData(lastId)}
        hasMore={listMessage.countMessage() < count}
        isLoading={loading}
        loading={<Loading />}
        isReverse
      >
        {listMessage.list.get().map(gm => <GroupMessage key={gm.sender + randomChars(5)} data={gm} />)}
      </InfiniteScroll>
    </div>
  )
}

export default ListMessage;