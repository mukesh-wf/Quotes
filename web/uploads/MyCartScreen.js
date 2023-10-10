import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Image, TouchableOpacity, } from 'react-native'
import { Snackbar, Button } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import BackButton from '../components/BackButton'
import { Ionicons } from '@expo/vector-icons'
import { useSelector, useDispatch } from 'react-redux';
import { useStyles } from '../styles/cartResponsive';
import { submitActions } from '../store/dataSlice'
import { SkeletonContainer } from 'react-native-dynamic-skeletons';

const MyCartScreen = ({ navigation, route }) => {
  const Cart_Style = useStyles();
  const cartData = useSelector(state => state.cartData.cart);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const totalPrice = useRef()
  const totaloldPrice = useRef()

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])

  const addOne = (id, quant) => {
    dispatch(submitActions.quantity(
      {
        id: id,
        quantity: quant + 1
      }
    ));
  }
  const subOne = (id, quant) => {
    if (quant > 1)
      dispatch(submitActions.quantity(
        {
          id: id,
          quantity: quant - 1
        }
      ));
  }

  const removeHandler = (index) => {
    dispatch(submitActions.remove(
      {
        index: index
      }
    ))
  }

  const totalAmount = () => {
    let sum = 0;
    for (let i = 0; i < cartData.length; i++) {
      sum = sum + cartData[i].oldprice * cartData[i].quantity
    }
    return sum;
  }

  const TAmount = totalAmount();
  const totalOldAmount = () => {
    let sum = 0;
    for (let i = 0; i < cartData.length; i++) {
      sum = sum + cartData[i].price * cartData[i].quantity
    }
    return sum;
  }
  const Tprice = totalOldAmount();
  const fee = 50;
  const [visible, setVisible] = useState(false);
  const onToggleSnackBar = () => {
    setVisible(!visible);
  }
  const onDismissSnackBar = () => {
    setVisible(false);
  }
  return (
    <View >
      <View style={Cart_Style.searchRoot}>
        <BackButton goBack={navigation.goBack} />
        <View style={Cart_Style.searchImgRoot}>
          <Text style={Cart_Style.mycartText}>MY CART</Text>
        </View>
      </View>
      {cartData.length < 1 ?
        <Text style={Cart_Style.emptyCart}>This Cart Is Empty</Text>
        :
        <ScrollView>
          {cartData.map((i, e) => {
            return (
              <View key={e} >
                <View key={e} style={Cart_Style.dataRoot}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("productDetail", i.categoriesDetail_id)}
                    style={Cart_Style.dataImgRoot}
                  >
                    <SkeletonContainer isLoading={loading}>
                      <Image source={{ uri: i.images }} style={Cart_Style.dataImg} />
                    </SkeletonContainer>
                  </TouchableOpacity>
                  <SkeletonContainer isLoading={loading}>
                    <View style={Cart_Style.textRoot} >
                      <Text numberOfLines={2} style={Cart_Style.textDescription}>{i.description}</Text>
                    </View>
                  </SkeletonContainer>
                  <View>
                    <SkeletonContainer isLoading={loading}>
                      <Ionicons
                        name="close-outline"
                        color={'black'}
                        size={20}
                        style={{ alignSelf: 'flex-end' }}
                        onPress={() => removeHandler(e)}
                      />
                    </SkeletonContainer>
                    <SkeletonContainer isLoading={loading}>
                      <View style={Cart_Style.buttonRoot}>
                        <TouchableOpacity onPress={() => subOne(e, i.quantity)} style={(i.quantity < 1) ? Cart_Style.blackButton : Cart_Style.whiteButton} >
                          <Text style={Cart_Style.blackText}>-</Text>
                        </TouchableOpacity>
                        <Text style={Cart_Style.blackText}>{i.quantity}</Text>
                        <TouchableOpacity onPress={() => addOne(e, i.quantity)} style={(i.quantity >= 1) ? Cart_Style.blackButton : Cart_Style.whiteButton} >
                          <Text style={(i.quantity >= 1) ? Cart_Style.whiteText : Cart_Style.blackText} >+</Text>
                        </TouchableOpacity>
                      </View>
                    </SkeletonContainer>
                  </View>
                  <SkeletonContainer isLoading={loading}>
                    <View style={Cart_Style.textPriceRoot} key={e}>
                      <Text style={Cart_Style.oldprice}>₹{(totalPrice.current = i.oldprice * i.quantity).toFixed(2)}</Text>
                      <Text style={Cart_Style.slace}> </Text>
                      <Text style={Cart_Style.price}>₹{(totaloldPrice.current = i.price * i.quantity).toFixed(2)}</Text>
                    </View>
                  </SkeletonContainer>
                </View>
                <View style={Cart_Style.baseLine}></View>
              </View>
            )
          })}
          <SkeletonContainer isLoading={loading}>
            <TouchableOpacity
              style={Cart_Style.TextInputRoot}
              onPress={() => navigation.navigate('coupan')}
            >
              <Ionicons
                name="ios-pricetag"
                color={'#C68625'}
                size={25}
                style={Cart_Style.coupon_icon}
              />
              <Text style={Cart_Style.coupon_text}>Use Coupons</Text>
            </TouchableOpacity>
          </SkeletonContainer>
          <SkeletonContainer isLoading={loading}>
            <View style={Cart_Style.TextInputRoot2} >
              <Text style={Cart_Style.price_summary}>Price Summary</Text>
            </View>
          </SkeletonContainer>
          <View style={Cart_Style.totalRoot}>
            <SkeletonContainer isLoading={loading}>
              <View style={Cart_Style.subtotalRoot}>
                <Text style={Cart_Style.subtotal}>Order Total</Text>
                <Text style={Cart_Style.total}>₹{TAmount.toFixed(2)}</Text>
              </View>
            </SkeletonContainer>
            <SkeletonContainer isLoading={loading}>
              <View style={Cart_Style.subtotalRoot}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={Cart_Style.subtotal}>Shipping</Text>
                  <TouchableOpacity style={{ marginLeft: "5%" }}>
                    <Ionicons
                      name="information-circle-outline"
                      color={'blue'}
                      size={18}
                      onPress={onToggleSnackBar}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row' }}>
                    {Tprice < 499 ?
                      <Text style={Cart_Style.free_price}>₹{fee.toFixed(2)}</Text> :
                      <Text style={Cart_Style.total}> Free</Text>
                    }
                  </View>
                </View>
              </View>
            </SkeletonContainer>
            <SkeletonContainer isLoading={loading}>
              <View style={Cart_Style.subtotalRoot}>
                <Text style={Cart_Style.subtotal}>Promo Discount</Text>
                <Text style={Cart_Style.total}> n/a</Text>
              </View>
            </SkeletonContainer>
            <SkeletonContainer isLoading={loading}>
              <View style={Cart_Style.subtotalRoot}>
                <Text style={Cart_Style.maintotal}>Total</Text>
                {Tprice < 499 ?
                  <Text style={Cart_Style.mainprice}>₹{(totalOldAmount() + fee).toFixed(2)}</Text>
                  : <Text style={Cart_Style.mainprice}>₹{totalOldAmount().toFixed(2)}</Text>
                }
              </View>
            </SkeletonContainer>
          </View>
          <View style={Cart_Style.baseLine2} ></View>
          <View style={Cart_Style.checkoutbuttonRoot} >
            <SkeletonContainer isLoading={loading}>
              {Tprice < 499 ?
                <Button style={Cart_Style.checkoutButton} onPress={() => navigation.navigate('checkOut', { Tm: totalOldAmount(), fee: fee, Tp: Tprice })}>
                  <Text style={Cart_Style.checkoutText}>PROCEED TO CHECKOUT</Text>
                </Button>
                : <Button style={Cart_Style.checkoutButton} onPress={() => navigation.navigate('checkOut', { Tm: totalOldAmount() })}>
                  <Text style={Cart_Style.checkoutText}>PROCEED TO CHECKOUT</Text>
                </Button>
              }
            </SkeletonContainer>
            <SkeletonContainer isLoading={loading}>
              <Button style={Cart_Style.countinueButton} onPress={() => navigation.navigate('Home')}>
                <Text style={Cart_Style.checkoutText}>CONTINUE SHOPPING</Text>
              </Button>
            </SkeletonContainer>
          </View>
        </ScrollView>
      }
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={2000}
        style={Cart_Style.Snackbar_style}
      >
        <Text style={Cart_Style.Snackbar_text}>Shipping charges of Rs. 50.00 wil apply on order below Rs. 499.00</Text>
      </Snackbar>
    </View>
  )
}
export default MyCartScreen;
