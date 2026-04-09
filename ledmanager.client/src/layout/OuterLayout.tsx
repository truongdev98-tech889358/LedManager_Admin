import { Outlet } from 'react-router-dom'

const OuterLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default OuterLayout
