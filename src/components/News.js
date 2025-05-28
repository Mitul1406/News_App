import React, { Component } from "react";
import NewsItems from "./NewsItems";
import Spinner from "./Spinner";
import PropTypes from 'prop-types';
import InfiniteScroll from "react-infinite-scroll-component";

class News extends Component {
  static defaultProps = {
    country: 'in',
    category: 'general',
  }

  static propTypes = {
    country: PropTypes.string,
    category: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      page: 1,
      totalNews: 0,
      pageSize: 10,
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.fetchNews();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.category !== this.props.category) {
      // Reset state before fetching new data
      this.setState({
        articles: [],
        page: 1,
        totalNews: 0,
        loading: true,
        error: null
      }, this.fetchNews);
    }
  }

  fetchNews = async () => {
    const { country, category } = this.props;
    const { page, pageSize } = this.state;

    const url = `https://gnews.io/api/v4/top-headlines?country=${country}&lang=en&topic=${category}&token=438e09b9fc7e7f8d85a37bdb7e9819b9&max=${pageSize}&page=${page}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (!data.articles) throw new Error("No articles found in the response.");

      this.setState(prevState => ({
        articles: prevState.articles.concat(data.articles),
        totalNews: data.totalArticles || 0,
        page: prevState.page + 1,
        loading: false
      }));
    } catch (error) {
      console.error("Error in fetching data:", error);
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { articles, totalNews, error } = this.state;

    if (error) {
      return <div className="text-danger text-center">Error: {error.message}</div>;
    }

    return (
      <>
        <h1 className="text-center" style={{ marginTop: '70px' }}>Top News - {this.props.category.toUpperCase()}</h1>
        <InfiniteScroll
          dataLength={articles.length}
          next={this.fetchNews}
          hasMore={articles.length < totalNews}
          loader={<Spinner />}
          style={{ overflow: "hidden" }}
        >
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {articles.map((element, index) => (
              <div className="col" key={index}>
                <NewsItems
                  title={element.title?.slice(0, 40) || "No title"}
                  description={element.description?.slice(0, 50) || "No description"}
                  imgUrl={element.image || "https://via.placeholder.com/300x200.png?text=News"}
                  readMoreUrl={element.url}
                  author={element.source?.name || "Unknown"}
                  date={new Date(element.publishedAt).toUTCString()}
                />
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </>
    );
  }
}

export default News;
