export const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export const SOCKET_URL=import.meta.env.VITE_SOCKET_URL||API.replace(/\/api\/?$/,'');
export async function api(path,{method='GET',body,token}={}){const res=await fetch(`${API}${path}`,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});let data={};try{data=await res.json()}catch{}if(!res.ok)throw new Error(data.error||'Unable to complete this request.');return data}
export async function apiFile(path,{token}={}){const res=await fetch(`${API}${path}`,{headers:token?{Authorization:`Bearer ${token}`}:{}});if(!res.ok){let data={};try{data=await res.json()}catch{}throw new Error(data.error||'Unable to open this file.')}return res.blob()}
export const equipmentTypes=['Tractor','Harvester','Transportation','Rotavator','Cultivator','Seeder','Plough','Sprayer','Thresher','Land Leveller','Other'];
