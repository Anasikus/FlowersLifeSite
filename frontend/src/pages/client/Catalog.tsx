import { useEffect, useState } from "react";
import type { Product } from "../../types/Product";
import ProductCard from "../../components/ProductCard";
import Header from "../../components/Header";

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки товаров:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "2rem", fontSize: "18px" }}>
          Загрузка товаров...
        </div>
      </>
    );

  return (
    <>
      <Header />
      <div
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "1.5rem" }}>Каталог товаров</h2>

        {products.length === 0 ? (
          <p style={{ fontSize: "16px", opacity: 0.7 }}>Товары не найдены</p>
        ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
                alignItems: "start",
              }}
            >

            {products.map((product) => (
              <ProductCard key={product.idProducts} product={product} />
            ))} 
          </div>
        )}
      </div>
    </>
  );
};

export default Catalog;
