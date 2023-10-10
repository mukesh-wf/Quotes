import React, { useEffect, useState } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AdminForm from './adminemail';
import CustomerForm from './customeremail';
import { useAuthenticatedFetch } from '../hooks'


const EmailSetting
= () => {
    return (
      <Tabs
        defaultActiveKey="adminform"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="customerform" title="Customer Email Setting">
          <CustomerForm />
        </Tab>
        <Tab eventKey="adminform" title="Admin Email Setting">
          <AdminForm />
        </Tab>

      </Tabs>
    )
  }

export default EmailSetting
