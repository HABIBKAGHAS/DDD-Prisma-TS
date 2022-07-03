interface ResultResponse {
  data: any[];
  meta: {
    currentPage: number;
    lastPage: number;
    limit: number;
    skip: number;
  };
}

export default ResultResponse;
