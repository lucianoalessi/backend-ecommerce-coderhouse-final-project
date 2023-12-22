import supertest from "supertest";
import chai from "chai";
import app from "../../server.js";

const expect = chai.expect;
const request = supertest(app);

describe('Cart Controller', () => {
    
    let cartID;
    let productID = '657b54fbd367add9795fa4ff';
    let cookie;
    let reqBody = {
        email: 'prueba@gmail.com',
        password: '123456'
    };

    before(async() => {
        try {
            const res = await request.post('/api/sessions/login').send(reqBody);
            const cookieResult = res.headers['set-cookie'][0];
            expect(cookieResult).to.be.ok
            expect(res.statusCode).to.equal(200);
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            expect(cookie.name).to.be.ok.and.eql('coderCookie');
            expect(cookie.value).to.be.ok;
        } catch (error) {
            console.error(error);
            expect.fail('Request failed');
        }
        
    });

    it('debería obtener todos los carritos', async () => {
        const res = await request.get('/api/carts');
        expect(res.statusCode).to.equal(200);
        expect(res.body.payload).to.be.an('array');
        expect(res.body.status).to.equal('success');
    });


    it('should create a cart', async () => {
        const res = await request.post('/api/carts')
        expect(res.body.status).to.equal('success');
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.body.payload).to.have.property('_id');
        cartID = res.body.payload._id
    });

    it('should get a cart by id', async () => {
        const res = await request.get(`/api/carts/${cartID}`) 
        expect(res.body.status).to.equal('success');
        expect(res.body.payload).to.have.property('_id');
    });

    it('debería agregar un producto a un carrito', async () => {
        try {
            const res = await request.post(`/api/carts/${cartID}/product/${productID}`).set('Cookie',[`${cookie.name}=${cookie.value}`] );
            console.log(res.body)
            expect(res.statusCode).to.equal(200);
            expect(res.body.status).to.equal('success: producto agregado al carrito correctamente');
            expect(res.body.payload.products[0]).to.have.property('_id');
        } catch (error) {
            console.error(error);
        }
    });

    // it('should delete a product in a cart', async () => {
    //     const res = await request.delete(`/api/carts/${cartID}/product/${productID}`).set('Cookie',[`${cookie.name}=${cookie.value}`] );
    //     expect(res.body.status).to.equal('success');
    // });

    it('debería modificar la cantidad de un producto en un carrito', async () => {
        const newQuantity = { newQuantity: 3 };
        const res = await request.put(`/api/carts/${cartID}/product/${productID}`).send(newQuantity).set('Cookie',[`${cookie.name}=${cookie.value}`] );;
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('success');
    }).timeout(5000);
    
    it('should delete a product in a cart', async () => {
        const res = await request.delete(`/api/carts/${cartID}/product/${productID}`).set('Cookie',[`${cookie.name}=${cookie.value}`]);
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('success');
    });

    it('debería agregar un array de productos a un carrito', async () => {
        const productsToAdd = [{ productID: '657b3190dc980673ea79ff8b', quantity: 2 }, { productID: '657b5429d367add9795fa4ab', quantity: 1 }];
        const res = await request.put(`/api/carts/${cartID}`).send(productsToAdd);
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Productos agregados con éxito');
    });

    it('should delete all products in a cart', async () => {
        const res = await request.delete(`/api/carts/${cartID}`).set('Cookie',[`${cookie.name}=${cookie.value}`]);
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Carrito vaciado con éxito');
    });

    it('debería finalizar la compra y generar un ticket', async () => {
        const res = await request.get(`/api/carts/${cartID}/purchase`).set('Cookie',[`${cookie.name}=${cookie.value}`]);
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.payload.ticket).to.be.ok;
        expect(res.body.payload.productosProcesados).to.be.an('array');
        expect(res.body.payload.productosNoProcesados).to.be.an('array');
    });

    it('debería finalizar la compra sin procesar productos por falta de stock', async () => {
        // Aquí necesitarías configurar tu carrito para que tenga productos sin stock
        const res = await request.get(`/api/carts/${cartID}/purchase`).set('Cookie',[`${cookie.name}=${cookie.value}`]);
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('No se procesaron productos, por falta de stock.');
        expect(res.body.productosNoProcesados).to.be.an('array');
    });
});
