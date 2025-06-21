import { useState } from "react"
import Header from '../components/Header/Header'
import ProductList from '../components/Products/ProductList'

const Products = () => {
 const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  return (
    <div>
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      <ProductList searchQuery={searchQuery} />
    </div>
  )
}


export default Products
