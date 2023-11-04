import React from 'react'
import Navbar from './Navbar'
import { ToastContainer } from 'react-toastify';


const Layout = ({children}) => {
  return (
    <div>
        <ToastContainer limit={1}/>
        <Navbar/>
        {children}
    </div>
  )
}

export default Layout