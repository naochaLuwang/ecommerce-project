import axios from 'axios';
import Layout from '../../../components/Layout';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useEffect, useContext, useReducer, useState } from 'react';
import { getError } from '../../../utils/error';
import { Store } from '../../../utils/Store';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  List,
  ListItem,
  ListItemText,
  TextField,
  CircularProgress,
  Button,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
}

const UserEdit = ({ params }) => {
  const userId = params.id;
  const { state } = useContext(Store);
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();
  const { userInfo } = state;

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: 'FETCH_REQUEST' });
          const { data } = await axios.get(`/api/admin/users/${userId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          setIsAdmin(data.isAdmin);
          dispatch({ type: 'FETCH_SUCCESS' });
          setValue('name', data.name);
        } catch (err) {
          dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        }
      };
      fetchData();
    }
  }, []);

  const submitHandler = async ({ name }) => {
    closeSnackbar();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          isAdmin,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      router.push('/admin/users');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };
  return (
    <Layout title={`Edit User ${userId}`}>
      <div className="container">
        <div className="columns">
          <div className="column is-4">
            <div className="card">
              <List>
                <NextLink href="/admin/dashboard" passHref>
                  <ListItem selected button component="a">
                    <ListItemText primary="Admin Dashboard"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/admin/orders" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Orders"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/admin/products" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Products"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/admin/users" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Users"></ListItemText>
                  </ListItem>
                </NextLink>
              </List>
            </div>
          </div>
          <div className="column is-8 mt-4">
            <div className="card">
              <div className="card-content">
                <div className="content">
                  <h1 className="is-size-5 title has-text-link">
                    Edit User ${userId}
                  </h1>
                  {loading ? (
                    <div>
                      <CircularProgress />
                    </div>
                  ) : error ? (
                    <h1>{error}</h1>
                  ) : (
                    <form onSubmit={handleSubmit(submitHandler)}>
                      <List>
                        <ListItem>
                          <Controller
                            name="name"
                            control={control}
                            defaultValue=""
                            rules={{
                              required: true,
                            }}
                            render={({ field }) => (
                              <TextField
                                variant="outlined"
                                fullWidth
                                id="name"
                                label="Name"
                                error={Boolean(errors.name)}
                                helperText={
                                  errors.name ? 'Name is required' : ''
                                }
                                {...field}
                              ></TextField>
                            )}
                          ></Controller>
                        </ListItem>
                        <ListItem>
                          <FormControlLabel
                            label="Is Admin"
                            control={
                              <Checkbox
                                onClick={(e) => setIsAdmin(e.target.checked)}
                                checked={isAdmin}
                                name="isAdmin"
                              />
                            }
                          ></FormControlLabel>
                        </ListItem>
                        <ListItem>
                          <button className="button is-link is-fullwidth is-size-5">
                            Update
                          </button>
                        </ListItem>
                      </List>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}

export default dynamic(() => Promise.resolve(UserEdit), { ssr: false });
