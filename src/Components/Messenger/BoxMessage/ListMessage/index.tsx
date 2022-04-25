import Message from './Message';

import styles from './list-message.module.scss';

const ListMessage = () => {
  const listMessages = [
    {
      _id: '1',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '112',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '111',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '222',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '31',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '42',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '51',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '62',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '10',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '12',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '8',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '9',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '6',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '7',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '19',
      userID: '123',
      message: 'Làm đi bạn'
    },
    {
      _id: '29',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
    {
      _id: '49',
      userID: '123',
      message: 'Làm đi bạn'.repeat(50)
    },
    {
      _id: '25',
      userID: '625a9089452f184e856c7ed9',
      message: 'Oke bạn ơi',
    },
  ]
  return (
    <div className={styles.listMessage}>
      { listMessages.map(message => <Message key={message._id} data={message} />)}
    </div>
  )
}

export default ListMessage;