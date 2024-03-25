import requests
from fastapi import HTTPException, APIRouter
from app.api.models.CompanyLogo import CompanyLogo
from app.const import headers

RouterCompanyLogo = APIRouter()
@RouterCompanyLogo.post("/company/logo/get/")
async def getCompanyImage(params:CompanyLogo):
    code = params.stockCode
    api_url = f'https://api.api-ninjas.com/v1/logo?ticker={code}'
    try:
        response = requests.get(api_url, headers={'X-Api-Key': headers['API-NINJA-KEY']})
        if len(response.json()) > 0 and response.json()[0]['image']:
            return response.json()[0]['image']
        else:
            return ' '

    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid stock object")
