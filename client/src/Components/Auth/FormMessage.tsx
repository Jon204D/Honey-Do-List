import React from 'react';

const FormMessage: React.FC<{ message: string}> = ({message}) => ( 
  <p 
    style = {{ 
      color: "orange", 
      fontWeight: "bold"
    }}
  >
    {message}
  </p>
)

export default FormMessage;