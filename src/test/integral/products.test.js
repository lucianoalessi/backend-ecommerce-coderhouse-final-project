import supertest from "supertest";
import chai from "chai";
import app from "../../server.js";

const expect = chai.expect;
const request = supertest(app);

describe('API de productos', () => {
    let productId;

    const productMock = {
        title: "gabinete corsair1313131",
        description: "gabinete gamer para pc de esclitorio nuevo",
        price: 125 ,
        thumbnail: "no hay",
        code: "PC123E1235151",
        stock: 25,
        category: "pc",
        status: true,
        owner: "admin"
    }
    const updatedProductMock = {
      title: 'Producto actualizado',
      price: 150
    };
  
    it('debería crear un nuevo producto', async () => {
      const res = await request.post('/api/products').send(productMock);
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body.payload).to.have.property('_id');
      productId = res.body.payload._id;
    });
  
    it('debería obtener el producto creado', async () => {
      const res = await request.get(`/api/products/${productId}`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.payload).to.have.property('title', productMock.title);
      expect(res.body.payload).to.have.property('price', productMock.price);
    });
  
    it('debería actualizar el producto creado', async () => {
      const res = await request.put(`/api/products/${productId}`).send(updatedProductMock);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.payload).to.have.property('title', updatedProductMock.title);
      expect(res.body.payload).to.have.property('price', updatedProductMock.price);

    });
  
    it('debería eliminar el producto creado', async () => {
      const res = await request.delete(`/api/products/${productId}`);
      expect(res.statusCode).to.equal(204);
    });
  });
